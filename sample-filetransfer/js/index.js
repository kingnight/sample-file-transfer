document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    navigator.splashscreen.hide();
    getFilesystem(
        function(fileSystem) {
            console.log("success");
            transferFile(fileSystem.root.fullPath);
        },
        function() {
            console.log("failed to get filesystem");
        }
    );
}

function getFilesystem(success, fail){
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
}

function transferFile(fileSystemPath){
    var transfer = new FileTransfer(),
    uri = encodeURI("http://icenium.com/assets/img/icenium-logo.png");
    filePath = fileSystemPath+'/sample.png';
    transfer.download(
        uri,
        filePath,
        function(entry) {
            var image = document.getElementById("result");
            image.src=entry.fullPath;
        },
        function(error) {
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        }
    );
}

