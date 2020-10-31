//will give us our username and our rank compared to other users that have submitted pictures
import React, { Fragment } from "react";
// import "./Rank.css";

const Rank = ({ name, entries }) => { //Lecture 285: Note: Code Change
  return (
    <Fragment>
      <div>
        <div className="white f3">{`${name}, your current entry count is...`}</div>
        <div className="white f1">{entries}</div>
      </div>
    </Fragment>
  );
};

export default Rank;
