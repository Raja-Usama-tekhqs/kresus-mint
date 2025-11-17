import React, { useEffect } from 'react'
import Webcam from "react-webcam";

const TakePicture = ({ setImage, setIsTakePhoto, handleNavigation, index }) => {
    const videoConstraints = {
        width: 363,
        height: 363,
        facingMode: "user",
    };

    useEffect(() => {
        navigator.getUserMedia =
            navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia;

        if (navigator.getUserMedia) {
            navigator.getUserMedia(
                { audio: true, video: { width: 1280, height: 720 } },
                (stream) => {
                    const video = document.querySelector("video");
                    video.srcObject = stream;
                    video.onloadedmetadata = (e) => {
                        video.play();
                    };
                },
                (err) => {
                    console.error(`The following error occurred: ${err.name}`);
                },
            );
        } else {
            console.log("getUserMedia not supported");
        }
    }, [])
    
    return (
        <>
            <video id="video" width="320" height="240" autoplay></video>
            {/* <input type='file' accept='video/*' capture/> */}
            {/* <Webcam
                audio={false}
                height={363}
                screenshotFormat="image/jpeg"
                width={363}
                videoConstraints={videoConstraints}
            >
                {({ getScreenshot }) => (
                    <button onClick={() => {
                        const imageSrc = getScreenshot();
                        setIsTakePhoto(false)
                        setImage(imageSrc)
                        handleNavigation(imageSrc, index)
                    }} className="take-photo">
                        Capture photo
                    </button>
                )}
            </Webcam> */}
        </>
    )
}

export default TakePicture