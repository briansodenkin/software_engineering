import React, { Component } from "react";
import { Redirect } from "react-router";
import ImageSection from "../components/ImageSection";
import Comments from "../components/Comments";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./TrailPage.css";
import MapSection from "../components/MapSection";
import GallerySection from "../components/GallerySection";

// New event form dialog
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import http from "../http-common";

class TrailPage extends Component {
  constructor() {
    super();
    this.state = {
      trailList: [],
      reviewList: [],
      showGallery: false,
      showEventForm: false,
      name: [],
      description: [],
      date: [],
      images: [],
      dimensions: [],
      imageList: [],
      redirect: false,
      showPopUpRequestSignIn: false,
    };
    this.rateElementRef = React.createRef();
  }

  // Buttons

  // Copy URL
  copyPageUrlToClipboard = () => {
    console.log("copy!");
    // copy the page url to cklipboard
    navigator.clipboard.writeText(window.location.href);
  };

  // Scroll
  executeScroll = () => {
    this.rateElementRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Handle new event dialog
  handleClickOpen = () => {
    // setOpen(true);
    this.setState({ showEventForm: true });
  };

  handleClose = () => {
    // setOpen(false);
    this.setState({ showEventForm: false });
  };

  submitEvent = () => {
    // Get form data

    console.log(this.state.name.value);
    console.log(this.state.date.value);
    console.log(this.state.description.value);
    console.log(this.state.trailList[0].id);

    let formData = new FormData();
    formData.append("eventName", this.state.name.value);
    formData.append("eventDescription", this.state.description.value);
    formData.append("eventTime", this.state.date.value);
    formData.append("trailID", this.state.trailList[0].id);
    formData.append("userID", 2);
    console.log("upload");

    http
      .post(
        //deafault second user id : 2
        "http://3.143.248.67:8080/events/add_event/",
        formData,
        {
          header: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        console.log(response);
        this.setState({ redirect: true });
      });
  };

  // Load trail info

  loadComments = () => {
    var get_all = "http://3.143.248.67:8080/trails/get_all/";
    //   "http://ec2-3-143-248-67.us-east-2.compute.amazonaws.com:8080/trails/get_all/";

    var id = this.props.match.params.trailID;
    var get_review = "http://ec2-3-143-248-67.us-east-2.compute.amazonaws.com:8080/review/get_all_by_trail/".concat(
      id
    );

    // Get trail details request
    fetch(get_all)
      .then((response) => response.json())
      .then((result) => {
        const trails = result.filter((item) => {
          if (item.id == id) {
            return item;
          }
        });
        this.setState({ trailList: trails });
      });

    // Get reviews request
    fetch(get_review)
      .then((response) => response.json())
      .then((result) => {
        const reviews = result.response.map((item) => {
          return item;
        });
        this.setState({ reviewList: reviews });
      });

    console.log("RELOAD");
  };

  componentDidMount() {
    this.loadComments();
  }

  toggleGallery = () => {
    this.state.showGallery
      ? this.setState({ showGallery: false })
      : this.setState({ showGallery: true });
  };

  popUpRequestSignIn = () => {
    this.setState({ showPopUpRequestSignIn: true });
  };

  closePopUpRequestSignIn = () => {
    this.setState({ showPopUpRequestSignIn: false });
  };

  render() {
    return (
      <>
        <ImageSection
          popUpRequestSignIn={this.popUpRequestSignIn}
          rateClicked={this.executeScroll}
          pageUrlCopier={this.copyPageUrlToClipboard}
          newEvent={this.handleClickOpen}
          trail={this.state.trailList[0]}
          ref={this.imageSectionRef}
          toggleGallery={this.toggleGallery}
          showGallery={this.state.showGallery}
        />
        {this.state.showGallery ? (
          <GallerySection
            images={this.state.images}
            trailID={this.state.trailList[0].id}
          />
        ) : (
          <div className={"trail-main-section"}>
            <div>
              <div className={"trail-map"}>
                {this.state.trailList.length > 0 ? (
                  <MapSection readOnly={true} trail={this.state.trailList[0]} />
                ) : null}
              </div>
            </div>
            <div ref={this.rateElementRef} className={"comment-section"}>
              <Comments
                trail={this.state.trailList[0]}
                reviews={this.state.reviewList}
                reloadComments={this.loadComments}
              />
            </div>
          </div>
        )}
        <Dialog
          open={this.state.showEventForm}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">New Event</DialogTitle>
          <DialogContent>
            <DialogContentText>Start an event on this trail:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Event Name"
              inputRef={(c) => {
                this.state.name = c;
              }}
              fullWidth
            />
            <TextField
              id="datetime-local"
              label="Event Date"
              type="datetime-local"
              // defaultValue={new Date()}
              className={"datetime-picker"}
              inputRef={(c) => {
                this.state.date = c;
              }}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Description"
              // type="email"
              fullWidth
              inputRef={(c) => {
                this.state.description = c;
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submitEvent} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={this.state.showPopUpRequestSignIn}>
          <DialogTitle id="alert-dialog-title">Login required</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This feature is only for registered users!
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.closePopUpRequestSignIn}
              color="primary"
              autoFocus
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
        {this.state.redirect ? <Redirect to="/events" /> : null}
      </>
    );
  }
}

export default TrailPage;
