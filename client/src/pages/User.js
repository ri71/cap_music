import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from "react-dom";
import ImageUploading from "react-images-uploading";
//import Script from 'react-load-script';
//import SpotifyWeb from 'spotify-web-api-js';
import Playlists from '../Spotistuff/Playlists';
import Songs from '../Spotistuff/Songs';
import Details from '../Spotistuff/Details';
import Search from '../Spotistuff/Search';
import LoginS from '../Spotistuff/Login';
import SearchAndSearchRes from '../Spotistuff/SearchAndSearchRes';

import axios from 'axios';
import "./User.css";
import '../App.css';

function App() {
  const [images, setImages] = React.useState([]);
  const maxNumber = 69;
  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };
  //console.log("In App");
  const [logInfo, setLogInfo]=useState('');
  const [cred, setCred]=useState();
  const playlists = useRef({selectedPlaylist:'', listOfPlaylistsFromAPI: []});
  const [dispPlaylist, setDispPlaylist] = useState();
  const [tracks, setTracks] = useState({selectedTrack:'', listOfTracksFromApi: ''});
  const [playing, setPlaying]=useState(true);
  const [qPlaylist, setQPlaylist] = useState('');
  const playlistTrack=useRef();
  //const params = getHashParams();
  useEffect(()=> {
    if (logInfo){
      //spotifyWebApi.setAccessToken(logInfo);
      axios('https://api.spotify.com/v1/me/playlists', {
          method: 'GET',
          headers: {'Authorization' : 'Bearer ' + logInfo}
        })
        .then((response) => {
          playlists.current={listOfPlaylistsFromAPI: response.data.items};
          setCred("right");
        })
        .catch(_=>{
            setCred("wrong");
          })
    }
  }, [logInfo]);

    // function getHashParams() {
  //   var hashParams = {};
  //   var e, r = /([^&;=]+)=?([^&;]*)/g,
  //       q = window.location.hash.substring(1);
  //   while ( e = r.exec(q)) {
  //      hashParams[e[1]] = decodeURIComponent(e[2]);
  //   }
  //   return hashParams;
  // }
  const getPlaylist= async (offset, curTracks, val)=>{
    await axios(`https://api.spotify.com/v1/playlists/${val}/tracks?offset=${offset}`, {
      method: 'GET',
      headers: {'Authorization' : 'Bearer ' + logInfo}
    })
    .then (response => {
      if(curTracks){
        curTracks.push(...response.data.items);
      }
      else{
        curTracks=response.data.items;
      }
      if(response.data.items.length===100){
        curTracks= getPlaylist(offset+100, curTracks, val);
      }
    })
    return curTracks;
  };

  return (
    <div className="App">
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
      >
        {({
          imageList,
          onImageUpload,
          onImageRemoveAll,
          onImageUpdate,
          onImageRemove,
          isDragging,
          dragProps
        }) => (
          // write your building UI
          <div className="upload__image-wrapper">
            <button
              style={isDragging ? { color: "red" } : null}
              onClick={onImageUpload}
              {...dragProps}
            >
              Click or Drop here
            </button>
            &nbsp;
            {imageList.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.data_url} alt="" width="100" />
                <div className="image-item__btn-wrapper">
                  <button onClick={() => onImageUpdate(index)}>Update</button>
                  <button onClick={() => onImageRemove(index)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ImageUploading>
      {(!cred || cred === "wrong") ? <LoginS setLoggedIn={setLogInfo} cred={cred} setCred={setCred} /> :
                    <>

                          <Search class="SearchPlaylist" placeh="Search playlist" setQuery={setQPlaylist} />
                          <SearchAndSearchRes logInfo={logInfo} playlists={playlists} getPlaylist={getPlaylist} playlistTrack={playlistTrack} setTracks={setTracks} tracks={tracks} setDispPlaylist={setDispPlaylist} />
                          <Playlists playlists={playlists} setDispPlaylist={setDispPlaylist} getPlaylist={getPlaylist} />
                          <div className="Box">
                                {dispPlaylist && <Songs logInfo={logInfo} playlists={playlists} tracks={tracks} setTracks={setTracks} playlistTrack={playlistTrack} dispPlaylist={dispPlaylist} setDispPlaylist={setDispPlaylist} query={qPlaylist} getPlaylist={getPlaylist} playing={playing} setPlaying={setPlaying} />}
                                {tracks.selectedTrack && <Details access_token={logInfo} tracks={tracks} setTracks={setTracks} playlistTrack={playlistTrack} playing={playing} setPlaying={setPlaying} />}

                          </div>
                    </>}
    </div>
  );
}
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

export default App