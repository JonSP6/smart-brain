//will give us our username and our rank compared to other users that have submitted pictures
import React, { Fragment } from "react";
import "./FaceRecognition.css";

const FaceRecognition = ({ imageUrl, box }) => {
  return (
    <Fragment>
      <div className="center ma">
        <div className="absolute mt2">
          <img
            id="inputImage"
            src={imageUrl}
            alt=""
            width="500px"
            height="auto"
          />
          <div
            className="bounding-box" //
            style={{
              top: box.topRow,
              right: box.rightCol,
              bottom: box.bottomRow,
              left: box.leftCol,
            }}
            /*style {} copy and pasted from inspect element on clarifai bounding box face example (https://www.clarifai.com/models/face-detection-image-recognition-model-a403429f2ddf4b49b307e318f00e528b-detection)  */
          ></div>
        </div>
      </div>
    </Fragment>
  );
};

export default FaceRecognition;

