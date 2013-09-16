// The players have to implement the following events
//
// play-song(song-object): If the song-object.type is handled by the player,
// it should start playing. The player should set $rootScope.currentPlayer to it's own name.
//
// end-song: The player should gracefully stop the current song and broadcast the song-finished event.
//
// == Broadcasting ==
// song-finished: When the song is finished.
//

window.karaokeApp.directive('cdgPlayer', ['$rootScope', function($rootScope) {
  var directiveObject = {
    scope: true,
    restrict: 'E',
    template: ' \
      <audio id="cdg_audio" style="width:324px"> \
        To use the JavaScript Subcode Graphics Player,<br>you must use an HTML5 audio/canvas compatible browser. [audio] \
      </audio> \
       \
      <div id="cdg_border"> \
        <canvas id="cdg_canvas" width="288" height="192"><!--style="image-rendering: optimizeSpeed"--> \
          To use the JavaScript Subcode Graphics Player,<br>you must use an HTML5 audio/canvas compatible browser. [canvas] \
        </canvas> \
      </div>',
    link: function($scope, iElement) {
      CDG_Player_init( "cdg_audio", "cdg_canvas", "cdg_border", "cdg_status" );

      $scope.audioElement = angular.element(iElement).find('audio')[0];
      $scope.canvas = angular.element(iElement).find('canvas');

      $scope.canvas.on('dblclick', function(event) {
        event.target.webkitRequestFullScreen();
      });

      $scope.endSong = function () {
        console.log('ending');
        $rootScope.songPlaying = false;
        $rootScope.$broadcast('song-finished');
      }

      $scope.audioElement.addEventListener('pause', $scope.endSong);

      $scope.massageFile = function(file) {
        console.log(file);
        var fileName = file;
        fileName = fileName.replace('.cdg', '');
        fileName = fileName.replace('.mp3', '');
        return fileName;
      }

      $scope.play = function(song) {
        $rootScope.currentPlayer = 'cdg';

        file = $scope.massageFile(song.file);
        console.log(file);

        // TODO: Refactor this
        set_file_prefix(file, file);
        $rootScope.songPlaying = true;
      }

      $rootScope.$on('play-song', function(event, song) {
        if(song.type == 'cdg'){
          $scope.play(song);
        }
      });

      $rootScope.$on('end-song', function() {
        if(!$scope.audioElement.paused) {
          $scope.audioElement.pause();
        }
      });
    }
  }
  return directiveObject;
}]);
