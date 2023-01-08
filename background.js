// Reads and parses a query string
function readQueryString(qs) {
  qs = qs.split('+').join(' ');
  const params = {};
  let tokens;
  const re = /[?&]?([^=]+)=([^&]*)/g;
  while ((tokens = re.exec(qs))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }
  return params;
}

// Gets YouTube video information for the given video ID
function getYouTubeVideoInfo(videoId) {
  const prefix = 'https://';
  const requestUrl = `${prefix}www.youtube.com/get_video_info?&video_id=${videoId}&eurl=http%3A%2F%2Fwww%2Eyoutube%2Ecom%2F&sts=1588`;
  const request = new XMLHttpRequest();
  request.open('GET', requestUrl, false);
  request.send(); // synchronous request

  if (request.status === 200) {
    const q = readQueryString(request.responseText);
    // If it has a token it's good enough
    if (q.token) {
      return q;
    }
  }
  // Can't get video info
  return null;
}

// Gets the YouTube video URL object for the given video information and quality
function getYouTubeVideoUrlObject(videoInfo, quality) {
  if (videoInfo.conn && videoInfo.conn.startsWith('rtmp')) {
    return videoInfo.conn;
  } else if (
    videoInfo.url_encoded_fmt_stream_map &&
    videoInfo.url_encoded_fmt_stream_map.length > 1
  ) {
    const urlData = [];
    const urlDataStrs = videoInfo.url_encoded_fmt_stream_map.split(',');
    for (const i in urlDataStrs) {
      const urlInfo = readQueryString(urlDataStrs[i]);
      const fmt = parseFlashconstiables(urlDataStrs[i]);
      urlInfo.url = urlInfo.url.replace(/^https/, 'http');
      if (urlInfo.sig) {
        urlInfo.url += `&signature=${urlInfo.sig}`;
      } else if (fmt.s) {
        urlInfo.url += `&signature=${decodeSignature(fmt.s)}`;
      }
      if (
        urlInfo.url &&
        urlInfo.itag &&
        urlInfo.type.lastIndexOf('video/mp4;', 0) === 0 && // We want only MP4 streams
        parseInt(urlInfo.itag) < 82 // We don't want 3D
      ) {
        urlData.push(urlInfo);
      }
    }
    urlData.sort((a, b) => b.itag - a.itag);

    if (quality && quality !== 'best') {
      const urlInfo = urlDataGetQuality(quality);
      if (urlInfo) {
        return urlInfo.url;
      }
    }
    return urlData[0].url;
  }
  return null;
}

// Sends a message to the current tab to play the YouTube video with the given video ID
function playYouTubeVideo(videoId, quality) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const videoInfo = getYouTubeVideoInfo(videoId);
    if (!videoInfo) {
      console.error(`Unable to get video info for video ID: ${videoId}`);
      return;
    }
    const videoUrlObject = getYouTubeVideoUrlObject(videoInfo, quality);
    if (!videoUrlObject) {
      console.error(`Unable to get video URL object for video ID: ${videoId}`);
      return;
    }
    const playPosition = getPlayPosition();
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'playVideo',
      videoUrlObject: videoUrlObject,
      hostname: getHostname(),
      playPosition: playPosition,
    });
  });
}

// Handles the "playVideo" event
chrome.extension.onMessage.addListener(function (
  request,
  sender,
  sendResponse
) {
  if (request.action == 'playVideo') {
    const videoId = request.videoId;
    const quality = request.quality;
    playYouTubeVideo(videoId, quality);
  }
});
