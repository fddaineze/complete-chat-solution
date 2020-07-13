<template>
  <form @submit.prevent="sendMessage">
    <!-- HEADER -->
    <div class="header">
      <label>Identificação</label>
      <input type="text" v-model="author" class="my-input" id="esconder" placeholder="Username" />
    </div>
    <!-- MESSAGE AREA -->
    <div class="messagearea">
      <p :class="checkAuthor(msg.author)" v-for="(msg, index) in messages" :key="index">
        <span class="author">{{ msg.author }}</span>
        <span class="text">{{ msg.message }}</span>
      </p>
    </div>
    <!-- FOOTER -->
    <div class="footer">
      <input type="text" v-model="message" class="my-input" placeholder="Send Message" />
      <button type="submit" class="my-button">Send</button>
    </div>
  </form>
</template>

<script>
import io from "socket.io-client";
export default {
  data() {
    return {
      author: "Eu",
      message: "",
      messages: [],
      socket: io("localhost:3000")
    };
  },
  methods: {
    checkAuthor(author) {
      if (this.author) {
        return author == this.author
          ? "message mymessage"
          : "message yourmessage";
      }
      return "message";
    },
    // Render msg
    renderMessage(message) {
      this.messages.push(message);

      // Scrolla ate o final
      this.$nextTick(() => {
        let area = document.getElementsByClassName("messagearea")[0];
        area.scrollTo(0, area.scrollHeight);
      });
    },
    // Send msg
    sendMessage(e) {
      e.preventDefault;
      if (this.author && this.message) {
        const objMessage = {
          author: this.author,
          message: this.message
        };
        this.socket.emit("sendMessage", objMessage);
        this.renderMessage(objMessage);
        this.message = "";
      }
    }
  },

  watch: {},

  mounted() {
    let that = this;
    // Receive msg
    that.socket.on("receivedMessage", message => {
      this.renderMessage(message);
    });

    // Receive ALL msg (connect)
    that.socket.on("previousMessages", messages => {
      for (const message of messages) {
        this.renderMessage(message);
      }
    });
  }
};
</script>

<style>
</style>