window.karaokeApp = angular.module('karaokeApp', ['firebase']);

window.karaokeApp.controller('karaokeController', ['$scope', '$http', '$filter', '$timeout', 'angularFire', '$rootScope', function($scope, $http, $filter, $timeout, angularFire, $rootScope) {

  var vlc = document.getElementById('karaoke-video');

  $scope.songs = [];
  $scope.playList = [];

  $scope.visibleSongs = [];

  var filterSongs = function() {
    $scope.visibleSongs = $filter('filter')($scope.songs, $scope.query);
    $scope.visibleSongs = $filter('orderBy')($scope.visibleSongs, 'artist');
    $scope.visibleSongs = $filter('limitTo')($scope.visibleSongs, 250);
  }

  var plref = new Firebase('https://irregaraoke-db.firebaseio.com/playlist');
  var sref = new Firebase('https://irregaraoke-db.firebaseio.com/songs');

  angularFire(plref, $scope, 'playList');
  angularFire(sref, $scope, 'songs').then(filterSongs);

  $scope.$watch('query', filterSongs);
  $scope.$watch('songs', filterSongs);

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
    $scope.playList.push(angular.copy(song));

    // Start playing if this is the only song
    if($scope.playList.length == 1 && !$rootScope.songPlaying) {
      $scope.playNext();
    }
  }

  $scope.skipSong = function() {
    $rootScope.$broadcast('end-song');
  }

  $scope.slaveMode = function() {
    $scope.slave = true;
  }

  $scope.addSongToDB = function(){
    $scope.songs.push($scope.new_song);
    $scope.new_song = {};
    filterSongs();
    $scope.addingSong = false;
  }

  $scope.removeSong = function(song) {
    index = $scope.playList.indexOf(song);
    $scope.playList.splice(index, 1);
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

    if($scope.playList.length > 0) {
      var song = $scope.playList.shift();
      song.type = $scope.guessType(song);
      $rootScope.$broadcast('play-song', song);
    }
  }

  $rootScope.$on('song-finished', function() {
    $scope.$apply($scope.playNext);
  });
}]);
