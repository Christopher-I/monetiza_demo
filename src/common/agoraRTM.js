// import AgoraRTM from 'agora-rtm-sdk';

// const APP_ID = 'YOUR_AGORA_APP_ID'; // Replace with your Agora App ID

// let rtmClient = null;
// let rtmChannel = null;

// export const initializeRTM = async (uid, token, channelName) => {
//   rtmClient = AgoraRTM.createInstance(APP_ID);

//   try {
//     await rtmClient.login({ uid, token });
//     console.log('RTM Login successful');

//     rtmChannel = rtmClient.createChannel(channelName);
//     await rtmChannel.join();
//     console.log(`Joined RTM channel: ${channelName}`);

//     return { rtmClient, rtmChannel };
//   } catch (error) {
//     console.error('RTM Initialization Error:', error);
//   }
// };

// export const sendMessage = async (message) => {
//   if (rtmChannel) {
//     try {
//       await rtmChannel.sendMessage({ text: message });
//       console.log('Message sent:', message);
//     } catch (error) {
//       console.error('Error sending message:', error);
//     }
//   }
// };

// export const listenForMessages = (callback) => {
//   if (rtmChannel) {
//     rtmChannel.on('ChannelMessage', ({ text }, senderId) => {
//       callback({ user: senderId, message: text });
//     });
//   }
// };

// export const leaveRTM = async () => {
//   if (rtmChannel) {
//     await rtmChannel.leave();
//     console.log('Left RTM channel');
//   }
//   if (rtmClient) {
//     await rtmClient.logout();
//     console.log('RTM Logout successful');
//   }
// };
