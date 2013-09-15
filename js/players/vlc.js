// The players have to implement the following events
//
// == Listening to ==
// play-song(song-object): If the song-object.type is handled by the player,
// it should start playing. The player should set $rootScope.currentPlayer to it's own name.
//
// end-song: The player should gracefully stop the current song and broadcast the song-finished event.
//
// == Broadcasting ==
// song-finished: When the song is finished.
//

// The VLC player
window.karaokeApp.directive('vlcPlayer', ['$rootScope', function factory($rootScope) {
  var directiveObject = {
    restrict: 'E',
    scope: true,
    template: "<embed type='application/x-vlc-plugin' class='vlc-karaoke-video'></embed>",
    link: function ($scope, iElement) {
      $scope.vlcEmbed = angular.element(iElement).children()[0];

      $scope.checkForPlaying = function() {
        // Song ended
        if($scope.vlcEmbed.input.state == 6 || $scope.vlcEmbed.input.state == 5) {
          window.clearInterval($scope.checkerId);
          $rootScope.songPlaying = false;
          $rootScope.$broadcast('song-finished');
        }
      }

      // This should be called once we have a working embed
      $scope.reallyPlay = function(song) {
        $scope.vlcEmbed.playlist.clear();
        $scope.vlcEmbed.playlist.add(song.file);
        $scope.vlcEmbed.playlist.play();
        $rootScope.songPlaying = true;

        // Check every two seconds if we are still running
        $scope.checkerId = window.setInterval($scope.checkForPlaying, 2000);
      }

      $scope.play = function(song) {
        $rootScope.currentPlayer = 'vlc';

        // wait until the player is available...
        var waiting = window.setInterval(function() {
          if($scope.vlcEmbed.playlist) {
            window.clearInterval(waiting);
            $scope.reallyPlay(song);
          }
        }, 300);
      }

      $rootScope.$on('play-song', function(event, song) {
        if(song.type == 'vlc') {
          $scope.play(song);
        }
      });

      $rootScope.$on('end-song', function() {
        if($scope.vlcEmbed.input && $scope.vlcEmbed.input.state < 5) {
          $scope.vlcEmbed.playlist.stop();
        }
      });
    }
  };
  return directiveObject;
}]);
