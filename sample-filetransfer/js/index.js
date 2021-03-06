document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	var that = this,
		App = new downloadApp(),
		fileName = "sample.png",
		//uri = encodeURI("http://www.telerik.com/sfimages/default-source/logos/app_builder.png"),
		uri = encodeURI("http://mediafiles.qiniudn.com/1.png"),
		folderName = "test";
    
	//navigator.splashscreen.hide();
	App.run(uri, fileName, folderName);
}

var downloadApp = function() {
}

downloadApp.prototype = {
	run: function(uri, fileName, folderName) {
		var that = this,
			filePath = "";
        
		document.getElementById("download").addEventListener("click", function() {
			that.getFilesystem(
				function(fileSystem) {
					console.log("gotFS");
                    
					if (device.platform === "Android") {
						that.getFolder(fileSystem, folderName, function(folder) {
							filePath = folder.toURL() + "\/" + fileName;
							that.transferFile(uri, filePath)
						}, function() {
							console.log("failed to get folder");
						});
					} else {
						var filePath;
						var urlPath = fileSystem.root.toURL();
						if (device.platform == "Win32NT") {
							urlPath = fileSystem.root.fullPath;
						}
						if (parseFloat(device.cordova) <= 3.2) {
							filePath = urlPath.substring(urlPath.indexOf("/var")) + "\/" + fileName;
						} else {
							filePath = urlPath + "\/" + fileName;
						}
						that.transferFile(uri, filePath)
					}
				},
				function() {
					console.log("failed to get filesystem");
				}
				);
		});
		
		document.getElementById("upload").addEventListener("click", that.uploadFile);
	},
    
	getFilesystem:function (success, fail) {
		window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
	},

	getFolder: function (fileSystem, folderName, success, fail) {
		fileSystem.root.getDirectory(folderName, {create: true, exclusive: false}, success, fail)
	},

	transferFile: function (uri, filePath) {
		var transfer = new FileTransfer();
		transfer.download(
			uri,
			filePath,
			function(entry) {
				var targetPath = entry.toURL();
				if (device.platform == "Win32NT") {
					targetPath = entry.fullPath;
				}
				var image = document.getElementById("downloadedImage");
				image.src = targetPath;
				image.style.display = "block";
				image.display = targetPath;
				document.getElementById("result").innerHTML = "File saved to: " + targetPath;
			},
			function(error) {
				document.getElementById("result").innerHTML = "An error has occurred: Code = " + error.code;
				console.log("download error source " + error.source);
				console.log("download error target " + error.target);
				console.log("upload error code" + error.code);
			}
			);
	},
	
	uploadFile: function() {
		navigator.camera.getPicture(
			uploadPhoto,
			function(message) {
				alert('Failed to get a picture');
			}, {
				quality         : 50,
				destinationType : navigator.camera.DestinationType.FILE_URI,
				sourceType      : navigator.camera.PictureSourceType.PHOTOLIBRARY
			});
		
		function uploadPhoto(fileURI) {
			var options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			
			if (cordova.platformId == "android") {
				options.fileName += ".jpg" 
			}
			
			options.mimeType = "image/jpeg";
			options.params = {}; // if we need to send parameters to the server request 
			options.headers = {
				Connection: "Close"
			};
			options.chunkedMode = false;
            
			var ft = new FileTransfer();
			ft.upload(
				fileURI,
				encodeURI("http://www.filedropper.com"),
				onFileUploadSuccess,
				onFileTransferFail,
				options);
		
			function onFileUploadSuccess (result) {
				console.log("FileTransfer.upload");
				console.log("Code = " + result.responseCode);
				console.log("Response = " + result.response);
				console.log("Sent = " + result.bytesSent);
				console.log("Link to uploaded file: http://www.filedropper.com" + result.response);
				var response = result.response;
				var destination = "http://www.filedropper.com/" + response.substr(response.lastIndexOf('=') + 1);
				document.getElementById("result").innerHTML = "File uploaded to: " + 
															  destination + 
															  "</br><button onclick=\"window.open('" + destination + "', '_blank', 'location=yes')\">Open Location</button>";
				document.getElementById("downloadedImage").style.display="none";
			}
        
			function onFileTransferFail (error) {
				console.log("FileTransfer Error:");
				console.log("Code: " + error.code);
				console.log("Source: " + error.source);
				console.log("Target: " + error.target);
			}
		}
	}
}
