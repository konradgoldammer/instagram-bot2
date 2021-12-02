const Instagram = require("instagram-web-api");
const mongoose = require("mongoose");
const Post = require("./models/Post");
const config = require("config");

const username = config.get("username");
const password = config.get("password");
const mongoURI = config.get("mongoURI");

const client = new Instagram({ username, password });

(async () => {
  try {
    mongoose.connect(mongoURI);

    const { authenticated } = await client.login();

    if (!authenticated) {
      throw "Couldn't log into Instagram; Check your credentials!";
    }

    console.log(`Logged in as ${username}.`);

    while (true) {
      const posts = await Post.find({});

      const potentialPhotoToRepost = async (usersToRepostFrom) => {
        const res = await client.getPhotosByUsername({
          username:
            usersToRepostFrom[
              Math.floor(Math.random() * usersToRepostFrom.length)
            ],
        });
        return res.user.edge_owner_to_timeline_media.edges[
          Math.floor(Math.random() * 5)
        ].node.display_url;
      };

      const usersToRepostFrom = ["memezar"];

      let photoToRepost;

      do {
        photoToRepost = await potentialPhotoToRepost(usersToRepostFrom);
      } while (posts.find((post) => post.url === photoToRepost));

      console.log(photoToRepost);

      await client.uploadPhoto({
        photo: photoToRepost,
        caption: "",
        post: "feed",
      });

      await new Post({ url: photoToRepost }).save();

      console.log("Uploaded new photo");

      await sleep(12 * 60 * 60 * 1000); // 12 hours
    }
  } catch (e) {
    console.error(e);

    mongoose.connection.close();
  }
})();

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
