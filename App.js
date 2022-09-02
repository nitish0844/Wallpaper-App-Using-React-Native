import React from "react";
import {
  ActivityIndicator,
  View,
  FlatList,
  Dimensions,
  Image,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Share,
} from "react-native";
import CameraRoll from "@react-native-camera-roll/camera-roll";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
// import { Permissions } from "expo";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// const isAndroid = Platform.OS === "android" ? marginTop: "220px" : 0;

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: true,
      images: [],
      scale: new Animated.Value(1),
      isImageFocused: false,
    };

    this.scale = {
      transform: [{ scale: this.state.scale }],
    };

    this.actionBarY = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [0, -80],
    });

    this.borderRadius = this.state.scale.interpolate({
      inputRange: [0.9, 1],
      outputRange: [30, 0],
    });
  }

  loadWallpaper = () => {
    axios
      .get(
        "https://api.unsplash.com/photos/random?count=30&client_id=pFv5vpeIX0qhfcP5HVdJHWTSY04tCliBqhIYRewquEI"
      )
      .then(
        function (response) {
          this.setState({ images: response.data, isLoading: false });
        }.bind(this)
      )
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {});
  };

  componentDidMount() {
    this.loadWallpaper();
  }

  saveToCameraRoll = async (image) => {
    const cameraPermissions = await Permissions.getAsync(
      Permissions.CAMERA_ROLL
    );
    if (cameraPermissions.status !== "granted") {
      cameraPermissions = await Permissions.askAsync(
        Permissions.CAMERA_ROLL,
        Permissions.CAMERA
      );
    }

    if (cameraPermissions.status === "granted") {
      FileSystem.downloadAsync(
        image.urls.regular,
        FileSystem.documentDirectory + image.id + ".jpg"
      )
        .then(({ uri }) => {
          CameraRoll.getPhotos(uri);
          alert("Saved to photos");
        })
        .catch((error) => {
          // console.log(error);
        });
    } else {
      alert("Requires cameral roll permission");
    }
  };

  showControls = (item) => {
    this.setState(
      (state) => ({
        isImageFocused: !state.isImageFocused,
      }),
      () => {
        if (this.state.isImageFocused) {
          Animated.spring(this.state.scale, {
            toValue: 0.9,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(this.state.scale, {
            toValue: 1,
            useNativeDriver: false,
          }).start();
        }
      }
    );
  };

  shareWallpaper = async (image) => {
    try {
      await Share.share({
        message: "Checkout this wallpaper" + image.urls.full,
      });
    } catch (error) {
      console.log(error);
    }
  };

  renderItem = ({ item }) => {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="red" />
        </View>
        <TouchableWithoutFeedback onPress={() => this.showControls(item)}>
          <Animated.View style={[{ height, width }, this.scale]}>
            <Animated.Image
              style={{
                flex: 1,
                height: "100%",
                width: null,
                borderRadius: this.borderRadius,
              }}
              source={{ uri: item.urls.regular }}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: this.actionBarY,
            height: 80,
            backgroundColor: "black",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.loadWallpaper()}
            >
              <Ionicons name="ios-refresh" color="white" size={40} />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.shareWallpaper(item)}
            >
              <Ionicons name="ios-share" color="white" size={40} />
            </TouchableOpacity>
          </View>
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => this.saveToCameraRoll(item)}
            >
              <Ionicons name="ios-save" color="white" size={40} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };

  render() {
    return this.state.isLoading ? (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="red" />
      </View>
    ) : (
      <View style={{ flex: 1, backgroundColor: "blue" }}>
        <SafeAreaView style={{ backgroundColor: "#fff" }}>
          <FlatList
            scrollEnabled={!this.state.isImageFocused}
            horizontal
            pagingEnabled
            data={this.state.images}
            renderItem={this.renderItem}
            keyExtractor={(item) => item.id}
          />
        </SafeAreaView>
      </View>
    );
  }
}
