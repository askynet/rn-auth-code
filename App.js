/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  Button,
  Dimensions,
  Linking
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { authorize, refresh, AuthConfiguration } from 'react-native-app-auth';

import { LoginManager, AccessToken, GraphRequest, GraphRequestManager } from "react-native-fbsdk";

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

import { Platform } from 'react-native';

import { appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid'

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const config = {
  issuer: 'https://login.microsoftonline.com/common',
  clientId: 'bf7d8ab7-5e55-41dc-a95e-3d7d55b02dd7',
  // clientId: '341139f5-cff3-4f80-befc-e9b90287984c',
  redirectUrl: 'com.demo://oauth/redirect',
  scopes: [
    'openid',
    'offline_access',
    'profile',
    'User.Read',
    'Calendars.ReadWrite'
  ]
};

const googleConfig = {
  issuer: 'https://accounts.google.com',
  clientId: '517037277626-1rk1in3mn9jk3u2di9lgcbcs5f6abn70.apps.googleusercontent.com',
  redirectUrl: 'com.demo:/oauth2redirect/google',
  scopes: ['openid', 'profile'],
  offlineAccess: true,
  skipCodeExchange: true,
};

const microsoftAuth = async () => {
  console.log('microsoft login');
  try {
    const result = await authorize(config);
    console.log('==================Microsoft==================>');
    console.log('====================================>');
    console.log('idToken', result.idToken);
    console.log('====================================>');
    console.log('refreshToken', result.refreshToken);
    console.log('====================================>');
    console.log('==================Microsoft End==================>');

  } catch (error) {
    console.log(error);
  }
};

class App extends React.Component {
  googleAuth;
  constructor(props) {
    super(props);
    this.state = {
      authCode: ''
    };
  }

  async componentDidMount() {
    Linking.addEventListener('url', this._handleURL.bind(this));
    await GoogleSignin.configure({
      // iOS
      // clientID: '517037277626-1rk1in3mn9jk3u2di9lgcbcs5f6abn70.apps.googleusercontent.com',
      iosClientId: '517037277626-m9l9q2p93ljq3irmphfnkpgfe9vr9ccp.apps.googleusercontent.com',

      // iOS, Android
      // https://developers.google.com/identity/protocols/googlescopes
      scopes: ['openid', 'profile'],


      // iOS, Android
      // https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#ae214ed831bb93a06d8d9c3692d5b35f9
      webClientId: '517037277626-b4nn0sets5cbqbbgrvlirhhjqhah8d0q.apps.googleusercontent.com',

      // Android
      // Whether to request server auth code. Make sure to provide `serverClientID`.
      // https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSigninOptions.Builder.html#requestServerAuthCode(java.lang.String, boolean)
      offlineAccess: true,

    });
  }
  render() {
    const isDarkMode = '';

    const backgroundStyle = {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    return (
      <SafeAreaView style={backgroundStyle}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}>
          <View style={{ height: Dimensions.get('screen').height, width: Dimensions.get('screen').width }}>
            <View style={styles.loginButtonSection}>

              <Button disabled={this.state.authCode === ''} onPress={() => {
                // alert(this.state.authCode);
                Clipboard.setString(this.state.authCode);
                // ToastAndroid.showWithGravityAndOffset(
                //   'auth code copied to clipboard',
                //   ToastAndroid.LONG,
                //   ToastAndroid.BOTTOM,
                //   25,
                //   50
                // );
              }}
                style={[styles.loginButton, { marginTop: 20 }]}
                title="Copy Auth Code"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', width: Dimensions.get('screen').width }}>
                <Button onPress={() => this.googleAuth()}
                  style={styles.loginButton}
                  title="Google"
                />

                <Button onPress={() => this._facebookLogin()}
                  style={styles.loginButton}
                  title="Facebook"
                />

                <Button onPress={() => this.onAppleButtonPress()}
                  style={styles.loginButton}
                  title="Apple"
                />

              </View>
              <Button disabled={this.state.authCode === ''} onPress={() => this.signOut()}
                style={styles.loginButton}
                title="Logout"
              />



            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  toast(msg) {
    // ToastAndroid.showWithGravityAndOffset(
    //   msg,
    //   ToastAndroid.LONG,
    //   ToastAndroid.BOTTOM,
    //   25,
    //   50
    // );
  }
  copy() {
    Clipboard.setString(this.state.authCode);
  }
  async googleAuth() {
    this.setState({
      authCode: ''
    });
    console.log('googleAuth login');
    try {

      const user = await GoogleSignin.signIn();

      if (user.serverAuthCode) {
        console.log(user);
        this.setState({
          authCode: user.serverAuthCode
        });
        ToastAndroid.showWithGravityAndOffset(
          'Please copy auth token by clicking above button',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM,
          25,
          50
        );
      }


    } catch (error) {
      ToastAndroid.showWithGravityAndOffset(
        'Something went wron:  ' + error,
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM,
        25,
        50
      );
      console.log(error);
    }
  }

  async signOut() {
    await GoogleSignin.signOut();
    this.setState({
      authCode: ''
    });
    ToastAndroid.showWithGravityAndOffset(
      'Logout',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
  }

  facebook() {
    const thisVar = this;
    LoginManager.logInWithPermissions(["public_profile", "email"]).then(
      function(result) {
        console.log('result', result);
        if (result.isCancelled) {
          thisVar.toast("Login cancelled");
        } else {
          thisVar.toast(
            "Login success with permissions: " +
              result.grantedPermissions.toString()
          );
          AccessToken.getCurrentAccessToken().then((data) => {
            console.log(data,data.accessToken.toString());
            const processRequest = new GraphRequest(
              '/me?fields=name,picture.type(large)',
              null,
              (error, result) => {
                if (error) {
                  //Alert for the Error
                  thisVar.toast('Error fetching data: ' + error.toString());
                } else {
                  //response alert
                  thisVar.toast(JSON.stringify(result));
                  console.log(JSON.stringify(result));
                }
              }
            );
            // Start the graph request.
            new GraphRequestManager()
              .addRequest(processRequest).start();
          });
        }
      },
      function(error) {
        thisVar.toast("Login fail with error: " + error);
      }
    );
  }

  _handleURL(event) {
    console.log('event', event);
    if (event.url && event.url.includes('?code=')) {
      var code = event.url.split('?code=');
      this.setState({
        authCode: code[1]
      });
      this.toast('Login Successfully')
      console.log('');
      console.log('=============================================');
      console.log('');
      console.log(code[1]);
      console.log('');
      console.log('=============================================');
      console.log('');
    }
  }
  _facebookLogin() {
    const url = [
      'https://www.facebook.com/v10.0/dialog/oauth',
      '?response_type=code',
      '&client_id='+'194683262299144',
      '&redirect_uri=fb194683262299144://authorize',
      '&scope=email' // Specify permissions
    ].join('');
    Linking.openURL(url);
  }

  async onAppleButtonPress() {
    // Generate secure, random values for state and nonce
    const rawNonce = uuid();
    const state = uuid();
  
    // Configure the request
    appleAuthAndroid.configure({
      // The Service ID you registered with Apple
      clientId: 'com.demo',
  
      // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
      // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
      redirectUri: 'fb194683262299144://authorize',
  
      // The type of response requested - code, id_token, or both.
      responseType: appleAuthAndroid.ResponseType.ALL,
  
      // The amount of user information requested from Apple.
      scope: appleAuthAndroid.Scope.ALL,
  
      // Random nonce value that will be SHA256 hashed before sending to Apple.
      nonce: rawNonce,
  
      // Unique state value used to prevent CSRF attacks. A UUID will be generated if nothing is provided.
      state,
    });
  
    // Open the browser window for user sign in
    const response = await appleAuthAndroid.signIn();
  
    console.log('response', response);
  }

}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  loginTextSection: {
    width: '100%',
    height: '30%',
  },

  loginButtonSection: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20
  },

  inputText: {
    marginLeft: '20%',
    width: '60%'
  },

  loginButton: {
    backgroundColor: 'blue',
    color: 'white'
  }
});

export default App;
