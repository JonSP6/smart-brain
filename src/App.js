import React, { Fragment, Component } from "react";
import Particles from "react-particles-js";
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import "./App.css";

const particlesOptions = {
  particles: {
    number: {
      value: 30,
      density: {
        enable: true,
        value_area: 800,
      },
    },
  },
};

const initialState = {
  input: "",
  imageUrl: "", //imageUrl should get displayed when we click button Detect
  box: {}, //this will contain the bound_box values top_row, left_col, bottom_row, right_col
  route: "signin", //route keeps track of where we are on the page. When the App initially loads we want it to start on "signin"
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
}; //calculateFaceLocation() will get the data based on the inputs from Clarifai

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  //Returns an object with the bounding box figures we need
  calculateFaceLocation = (data) => {
    const clarifaiFace = //clarifaiFace will contain the bounding_box object
      data.outputs[0].data.regions[0].region_info.bounding_box; //data from below -> .then((response) => this.calculateFaceLocation(response))
    const image = document.getElementById("inputImage"); //grabs the img in our FaceRecog Component
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      //We return an object. This object will fill out the box: {} state later on
      //Andrei will show us how he got the math below
      leftCol: clarifaiFace.left_col * width, //This is like saying bound_box.left_col
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  //Takes in the returned object (with the bound box figures) of calculateFaceLocation and updates this.state.box
  displayFaceBox = (box) => {
    //
    //console.log(box); //We can see the returned object from calculateFaceLocation in the console
    this.setState({ box: box }); //With ES6 we can syntactically shorten to this.setState({box})
  };

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  // Note:If the API isn't working because the API is down then try this `c0c0ac362b03416da06ab3fa36fb58e3` in place of Clarifai.FACE_DETECT_MODEL.
  onButtonSubmit = () => {
    this.setState({ imageUrl: this.state.input });

    fetch("https://secret-waters-82406.herokuapp.com/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
      }),
    })
      .then((response) => response.json())
      //this will be the url image our Face Recognition will work with. this.state.imageUrl doesn't work here becaues the way setState works in React, and is a trap that is difficult to debug.
      .then((response) => {
        if (response) {
          fetch("https://secret-waters-82406.herokuapp.com/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((resp) => resp.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log()); //Error handling
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      }) //The response is the bound_box object and we pass that to calculateFaceLocation and whatever calculateFaceLocation returns is then passed into displayFaceBox
      .catch((err) => console.log(err));
  };

  //Lecture 256 Sign In Form and Routing
  //Once the user enters sign in info and clicks the <input> button submit it will update this.state.route to whatever was passed to it. Now when App re-renders/updates the App will display the Logo, Rank, ImgaeLinkForm, and FaceRecog Comps
  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState); //upon sign out the state will be set back to initial state
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <Fragment>
        <div className="App">
          <Particles className="particles" params={particlesOptions} />
          <Navigation
            isSignedIn={isSignedIn}
            onRouteChange={this.onRouteChange}
          />
          {route === "home" ? (
            <Fragment>
              <Logo />
              <Rank
                name={this.state.user.name} //Lecture 285: Note: Code Change
                entries={this.state.user.entries} //Lecture 285: Note: Code Change
              />
              <ImageLinkForm
                onInputChange={this.onInputChange}
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl} />
            </Fragment>
          ) : route === "signin" ? (
            <Signin
              loadUser={this.loadUser} //Lecture 285: Note: Code Change
              onRouteChange={this.onRouteChange} //Lecture 285: Note: Code Change
            />
          ) : (
            <Register
              loadUser={this.loadUser}
              onRouteChange={this.onRouteChange}
            />
          )}
        </div>
      </Fragment>
    );
  }
}

export default App;

// Clarifai.FACE_DETECT_MODEL
// app.models
// .predict(
// Clarifai.COLOR_MODEL,
//     // URL
//     "https://samples.clarifai.com/metro-north.jpg"
// )
// .then(function(response) {
//     // do something with responseconsole.log(response);
//     },
//     function(err) {// there was an error}
// );

// Lecture 317: Quick Note: Updated API
// const handleApiCall = (req, res) => {
//   app.models
//     // You may have to do this:
//     // .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
//     .predict('c0c0ac362b03416da06ab3fa36fb58e3', req.body.input)
//     .then(data => {
//       res.json(data);
//     })
//     .catch(err => res.status(400).json('unable to work with API'))
// }

//FOR ANKI QUESTION BEFORE AND AFTER
//Smart Brain front end App.js
// import React, { Fragment, Component } from "react";
// import Particles from "react-particles-js";
// import Clarifai from "clarifai";
// import Navigation from "./components/Navigation/Navigation";
// import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
// import Logo from "./components/Logo/Logo";
// import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
// import Rank from "./components/Rank/Rank";
// import Signin from "./components/Signin/Signin";
// import Register from "./components/Register/Register";
// import "./App.css";

// const app = new Clarifai.App({
//   apiKey: "a1de17f91e1940039ba6063fec5b66f4",
// });

// onButtonSubmit = () => {
//   this.setState({ imageUrl: this.state.input });
//   app.models
//     .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
//     .then((response) => response.json())
//     .then((response) => {
//       if (response) {
//         fetch("http://localhost:3000/image", {
//           method: "put",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             id: this.state.user.id,
//           }),
//         })
//           .then((resp) => resp.json())
//           .then((count) => {
//             this.setState(Object.assign(this.state.user, { entries: count }));
//           })
//           .catch(console.log()); //Error handling
//       }
//       this.displayFaceBox(this.calculateFaceLocation(response));
//     })
//     .catch((err) => console.log(err));
// };

//Heroku Update: updating the endpoint's *************************
// onButtonSubmit = () => {
//   this.setState({ imageUrl: this.state.input });

//   fetch("http://localhost:3000/imageurl", {
//     method: "post",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       input: this.state.input,
//     }),
//   })
//     .then((response) => response.json())
//     .then((response) => {
//       if (response) {
//         fetch("http://localhost:3000/image", {
//           method: "put",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             id: this.state.user.id,
//           }),
//         })
//           .then((resp) => resp.json())
//           .then((count) => {
//             this.setState(Object.assign(this.state.user, { entries: count }));
//           })
//           .catch(console.log());
//       }
//       this.displayFaceBox(this.calculateFaceLocation(response));
//     })
//     .catch((err) => console.log(err));
// };
