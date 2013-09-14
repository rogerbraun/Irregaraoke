window.karaokeApp = angular.module('karaokeApp', ['firebase']);

window.karaokeApp.controller('karaokeController', ['$scope', '$http', '$filter', '$timeout', 'angularFire', function($scope, $http, $filter, $timeout, angularFire) {

  var vlc = document.getElementById('karaoke-video');

  $scope.checkForPlaying = function() {
    if(vlc.input.state == 6) {
      $scope.songPlaying = false;
      $scope.playNext();
    } else {
      $timeout($scope.checkForPlaying, 2000);
    }
  }

  $scope.songs = [];
  $scope.playList = [];

  $scope.visibleSongs = [];

  var filterSongs = function() {
    $scope.visibleSongs = $filter('filter')($scope.songs, $scope.query);
    $scope.visibleSongs = $filter('limitTo')($scope.visibleSongs, 250);
  }

  var plref = new Firebase('https://irregaraoke.firebaseio.com/playlist');
  var sref = new Firebase('https://irregaraoke-db.firebaseio.com/songs');
  angularFire(plref, $scope, 'playList');
  angularFire(sref, $scope, 'songs').then(filterSongs);

  $scope.$watch('query', filterSongs);
  $scope.$watch('songs', filterSongs);

  $scope.setQuery = function(query) {
    $scope.query = query;
  }

  $scope.addSong = function(song) {
    $scope.playList.push(angular.copy(song));
    if($scope.playList.length == 1 && !$scope.songPlaying) {
      $scope.playNext();
    }
  }

  $scope.slaveMode = function() {
    $scope.slave = true;
  }

  $scope.addSongToDB = function(){
    $scope.songs.push($scope.new_song);
    $scope.new_song = {};
    filterSongs();
  }

  $scope.removeSong = function(song) {
    index = $scope.playList.indexOf(song);
    $scope.playList.splice(index, 1);
  }

  $scope.playNext = function() {
    if($scope.slave) {
      return;
    }
    if($scope.playList.length > 0 ) {
      vlc.playlist.clear();
      var file = $scope.playList.shift().file;
      console.log(file);
      vlc.playlist.add(file);
      vlc.playlist.play();
      $scope.checkForPlaying();
      $scope.songPlaying = true;
    }
  }
}]);
