window.karaokeApp = angular.module('karaokeApp', []);

window.karaokeApp.controller('karaokeController', ['$scope', '$http', '$filter', '$timeout', function($scope, $http, $filter, $timeout) {

  var base = 'file:///home/roger/karaoke/';
  var vlc = document.getElementById('karaoke-video');

  $scope.checkForPlaying = function() {
    console.log('checking');
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

  $scope.$watch('query', filterSongs);

  $scope.setQuery = function(query) {
    $scope.query = query;
  }

  $scope.addSong = function(song) {
    $scope.playList.push(angular.copy(song));
    if($scope.playList.length == 1 && !$scope.songPlaying) {
      $scope.playNext();
    }
  }

  $scope.removeSong = function(song) {
    index = $scope.playList.indexOf(song);
    $scope.playList.splice(index, 1);
  }

  $scope.playNext = function() {
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


  $http.get('source/songs').success(function(data) {
    data = data.split('\n');
    angular.forEach(data, function(line) {
      var song = line.split("-");
      var file = '';
      if(song[2] && (song[2].substr('youtube') != -1)) {
        file = song[2].replace(/^\s+|\s+$/g, '');
      }
      else {
        file = base + line.replace('cdg', 'mp3');
      }

      if(line != "") {
        $scope.songs.push({artist: song[0], title: song[1].replace(/\[(K|k)araoke\].cdg/, ''), file: file});
      }
    });
    filterSongs();
  });
}]);
