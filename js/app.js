window.karaokeApp = angular.module('karaokeApp', ['firebase', 'ui.bootstrap']);

window.karaokeApp.controller('karaokeController', ['$scope', '$http', '$filter', '$timeout', 'angularFire', '$rootScope', function($scope, $http, $filter, $timeout, angularFire, $rootScope) {

  var vlc = document.getElementById('karaoke-video');

  $scope.songs = [];
  $scope.localSongs = [];

  // Fill local songs.
  $http.get('source/songs.json').success(function(data) {
    $scope.localSongs = data;
  });

  $scope.currentPage = 1;
  $scope.perPage = 10;

  $scope.remoteSongs = [];
  $scope.stuff = {};
  $scope.sessionName = 'standard';
  $scope.stuff[$scope.sessionName] = {};
  $scope.stuff[$scope.sessionName].playlist = [];
  $scope.stuff[$scope.sessionName].name = $scope.sessionName;

  $scope.playList = function() {
    var pl = $scope.stuff[$scope.sessionName].playlist;
    if(pl) {
      return pl;
    } else {
      $scope.stuff[$scope.sessionName].playlist = [];
      return $scope.stuff[$scope.sessionName].playlist;
    }
  }

  $scope.visibleSongs = [];
  $scope.filteredSongs = [];

  var filterSongs = function() {
    $scope.filteredSongs = $filter('filter')($scope.songs, $scope.query);
    $scope.filteredSongs = $filter('orderBy')($scope.filteredSongs, 'artist');
    $scope.currentPage = 1;
    $scope.setVisibleSongs();
  }

  $scope.setVisibleSongs = function () {
    var offset = ($scope.currentPage - 1) * $scope.perPage;
    $scope.visibleSongs = $scope.filteredSongs.slice(offset, offset + $scope.perPage);
  }

  var combineSongs = function() {
    $scope.songs = $scope.localSongs.concat($scope.remoteSongs);
  }

  var plref = new Firebase('https://irregaraoke-db.firebaseio.com/stuff');
  var sref = new Firebase('https://irregaraoke-db.firebaseio.com/songs');

  angularFire(plref, $scope, 'stuff');
  angularFire(sref, $scope, 'remoteSongs');

  $scope.$watch('query', filterSongs);
  $scope.$watch('songs', filterSongs);
  $scope.$watch('localSongs', combineSongs);
  $scope.$watch('remoteSongs', combineSongs);
  $scope.$watch('currentPage', $scope.setVisibleSongs);

  $scope.setQuery = function(query) {
    $scope.query = query;
  }

  $scope.isCurrentPlayer = function(playerName) {
    return $rootScope.currentPlayer == playerName;
  }

  $scope.showNewSong = function(query) {
    $scope.addingSong = true;
  }

  $scope.hideNewSong = function(query) {
    $scope.new_song = {};
    $scope.addingSong = false;
  }

  $scope.addSong = function(song) {
    $scope.playList().push(angular.copy(song));

    // Start playing if this is the only song
    if($scope.playList().length == 1 && !$rootScope.songPlaying) {
      $scope.playNext();
    }
  }

  $scope.skipSong = function() {
    if(!$rootScope.songPlaying) {
      $scope.playNext();
    } else {
      $rootScope.$broadcast('end-song');
    }
  }

  $scope.slaveMode = function() {
    $scope.slave = true;
  }

  $scope.addSongToDB = function(){
    $scope.remoteSongs.push($scope.new_song);
    $scope.new_song = {};
    //filterSongs();
    $scope.addingSong = false;
  }

  $scope.removeSong = function(song) {
    index = $scope.playList().indexOf(song);
    $scope.playList().splice(index, 1);
  }

  $scope.guessType = function(song) {
    if(song.file.indexOf('karaoke') != -1) {
      return 'cdg';
    } else {
      return 'vlc';
    }
  }

  $scope.playNext = function() {

    if($scope.slave) {
      return;
    }

    if($scope.playList().length > 0) {
      var song = $scope.playList().shift();
      song.type = $scope.guessType(song);
      $rootScope.$broadcast('play-song', song);
    }
  }

  $rootScope.$on('song-finished', function() {
    $scope.$apply($scope.playNext);
  });
}]);
