import React, { Component } from "react";
import Loader from "../../assets/components/loader/loader";
import "./main-auth.css";
import { _auth, _database, validField, logEvent } from "../../config/index";
export default class Login extends Component {
  state = { loading: false, currentScreen: "signIn" };
  componentDidMount() {
    this.props.init();
  }

  render() {
    return (
      <>
        {this.state.loading === true ? (
          <div
            style={{
              minHeight: "300px",
              animation:
                "animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
            }}
          >
            <Loader />
          </div>
        ) : this.state.currentScreen === "signIn" ? (
          <SignIn
            createAccount={() => {
              this.setState({ currentScreen: "createAccount" });
            }}
            closeToast={this.props.closeToast}
            showTimedToast={this.props.showTimedToast}
            showUnTimedToast={this.props.showUnTimedToast}
            authorizeUser={this.props.authorizeUser}
          />
        ) : this.state.currentScreen === "createAccount" ? (
          <CreateAccount
            SignIn={() => {
              this.setState({ currentScreen: "signIn" });
            }}
            authorizeUser={this.props.authorizeUser}
            closeToast={this.props.closeToast}
            showTimedToast={this.props.showTimedToast}
            showUnTimedToast={this.props.showUnTimedToast}
          />
        ) : (
          ""
        )}
      </>
    );
  }
}

class SignIn extends Component {
  state = {
    userName: "",
    password: "",
    auth: undefined,
  };
  componentDidMount() {
    this.db = _database.ref("users");
    this.db.on("value", (x) => {
      this.setState({ auth: x.child("active"), users: x.child("data") });
    });
  }
  componentWillUnmount() {
    this.db.off();
  }
  render() {
    return (
      <div className="main-auth">
        <img
          className="logo unselectable"
          alt=""
          src={require("../../assets/drawables/logo.png").default}
        />
        <div className="auth-form">
          <div className="field">
            <p className="title unselectable">Authentication</p>
            <p className="field-name unselectable">Email</p>
            <div className="field-input">
              <img
                alt=""
                src={require("../../assets/drawables/ic-email.png").default}
                className="unselectable"
              />
              <input
                value={this.state.userName}
                onChange={(e) => {
                  this.setState({ userName: e.target.value });
                }}
                name="userName"
                placeholder="User Name"
                style={{ maxWidth: "160px", marginRight: "5px" }}
              />
              <p className="unselectable">@mycompany.org</p>
            </div>
            <p className="field-name unselectable">Password</p>
            <div className="field-input">
              <img
                alt=""
                src={require("../../assets/drawables/ic-password.png").default}
                className="unselectable"
              />
              <input
                value={this.state.password}
                onChange={(e) => {
                  this.setState({ password: e.target.value });
                }}
                name="password"
                placeholder="Password"
                type="password"
              />
            </div>
            <div
              className="button"
              onClick={async () => {
                await setTimeout(async () => {
                  const { userName, password } = this.state;
                  if (validField(userName) && validField(password)) {
                    this.props.showUnTimedToast();
                    if (this.state.auth && this.state.auth.hasChild(userName)) {
                      if (
                        this.state.users.child(userName).val().userId === "new"
                      ) {
                      } else {
                        _auth
                          .signInWithEmailAndPassword(
                            userName + "@mycompany.org",
                            password
                          )
                          .then((x) => {
                            const id = x.user.email.split("@")[0];
                            this.db.child("staff/" + id).once("value", (d) => {
                              this.props.closeToast();
                              logEvent(
                                d.child("userName").val() + " has signed in.",
                                "staff/" + id + "/"
                              ).then((x) => {
                                if (x === true) {
                                  this.props.showTimedToast(
                                    "Sign in Successfull"
                                  );
                                  this.props.authorizeUser();
                                }
                              });
                            });
                          })
                          .catch(async (x) => {
                            this.props.closeToast();
                            await setTimeout(() => {
                              this.props.showTimedToast("Login Failed");
                            }, 300);
                          });
                      }
                    } else if (
                      this.state.auth === undefined ||
                      this.state.userId === undefined
                    ) {
                      this.props.showTimedToast("Please Hold");
                    } else {
                      this.props.showTimedToast("Unauthorized Login");
                    }
                  } else {
                    this.props.showTimedToast("All Fields are required");
                  }
                }, 200);
              }}
            >
              <img
                alt=""
                src={require("../../assets/drawables/ic-check.png").default}
                className="unselectable"
              />
              <p className="text unselectable">Sign In</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class CreateAccount extends Component {
  state = {
    enableEdit: true,
    userName: "",
    email: "",
    password: "",
    _password: "",
    authCode: "",
    authenticated: false,

    loading: true,
  };
  componentDidMount() {
    this.db = _database.ref("users/");
    this.db.child("create").on("value", (x) => {
      this.setState({ loading: false, auth: x });
    });
  }
  componentWillUnmount() {
    this.db.off();
  }
  render() {
    return (
      <div div className="main-auth">
        {this.state.loading === true ? (
          <div
            style={{
              marginTop: "150px",
              minHeight: "300px",
              animation:
                "animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
            }}
          >
            <Loader />
          </div>
        ) : this.state.authenticated === false ? (
          <div
            className="auth-form"
            style={{
              marginTop: "150px",
              animation:
                "fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
            }}
          >
            <div className="field">
              <p className="title unselectable">Authorize Function</p>
              <p className="field-name unselectable">Authentication Code</p>
              <div className="field-input">
                <img
                  alt=""
                  src={
                    require("../../assets/drawables/ic-password.png").default
                  }
                  className="unselectable"
                />
                <input
                  value={this.state.authCode}
                  onChange={(e) => {
                    this.setState({ authCode: e.target.value });
                  }}
                  name="authCode"
                  placeholder="authCode"
                  disabled={!this.state.enableEdit}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: "20px",
                  flex: 1,
                  marginBottom: "10px",
                }}
              >
                <p
                  className="link unselectable"
                  style={{ alignSelf: "flex-start", marginLeft: "20px" }}
                  onClick={async () => {
                    await setTimeout(() => {
                      this.props.SignIn();
                    }, 200);
                  }}
                >
                  Cancel
                </p>
                <p
                  className="link unselectable"
                  style={{ alignSelf: "flex-end", marginRight: "20px" }}
                  onClick={async () => {
                    await setTimeout(() => {
                      if (
                        this.state.auth.hasChild(
                          this.state.authCode.toUpperCase()
                        ) === true
                      ) {
                        this.setState({ authenticated: true });
                      } else {
                        this.props.showTimedToast("Invalid Code");
                      }
                    }, 200);
                  }}
                >
                  Proceed
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="auth-form"
            style={{
              marginTop: "50px",
              animation:
                "fade-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
            }}
          >
            <div className="field">
              <p className="title unselectable">Create Account</p>
              <p className="field-name unselectable">Email</p>
              <div className="field-input">
                <img
                  alt=""
                  src={require("../../assets/drawables/ic-email.png").default}
                  className="unselectable"
                />
                <input
                  value={this.state.email}
                  onChange={(e) => {
                    this.setState({ email: e.target.value });
                  }}
                  name="email"
                  placeholder="Email"
                  style={{ maxWidth: "160px", marginRight: "5px" }}
                />
                <p className="unselectable">@prolox.store</p>
              </div>
              <p className="field-name unselectable">User Name</p>
              <div className="field-input">
                <img
                  alt=""
                  src={require("../../assets/drawables/ic-user.png").default}
                  className="unselectable"
                />
                <input
                  value={this.state.userName}
                  onChange={(e) => {
                    this.setState({ userName: e.target.value });
                  }}
                  name="userName"
                  placeholder="User Name"
                  disabled={!this.state.enableEdit}
                />
              </div>
              <p className="field-name unselectable">Password</p>
              <div className="field-input">
                <img
                  alt=""
                  src={
                    require("../../assets/drawables/ic-password.png").default
                  }
                  className="unselectable"
                  type="password"
                />
                <input
                  value={this.state.password}
                  onChange={(e) => {
                    this.setState({ password: e.target.value });
                  }}
                  name="password"
                  placeholder="Password"
                  disabled={!this.state.enableEdit}
                  type="password"
                />
              </div>
              <p className="field-name unselectable">Confirm Your Password</p>
              <div className="field-input">
                <img
                  alt=""
                  src={
                    require("../../assets/drawables/ic-password.png").default
                  }
                  className="unselectable"
                />
                <input
                  value={this.state._password}
                  onChange={(e) => {
                    this.setState({ _password: e.target.value });
                  }}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  type="password"
                  disabled={!this.state.enableEdit}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: "20px",
                  flex: 1,
                  marginBottom: "10px",
                }}
              >
                <p
                  className="link unselectable"
                  style={{ alignSelf: "flex-start", marginLeft: "20px" }}
                  onClick={async () => {
                    await setTimeout(() => {
                      this.props.SignIn();
                    }, 200);
                  }}
                >
                  Cancel
                </p>
                <p
                  className="link unselectable"
                  style={{ alignSelf: "flex-end", marginRight: "20px" }}
                  onClick={async () => {
                    await setTimeout(() => {
                      const t = this.state;
                      console.log(t);
                      if (
                        validField(t._password) &&
                        validField(t.email) &&
                        validField(t.password) &&
                        validField(t.userName) &&
                        t._password === t.password
                      ) {
                        this.setState({ enableEdit: false });
                        this.props.showUnTimedToast("Creating Account");
                        const { email, userName, password } = t;
                        _auth
                          .createUserWithEmailAndPassword(
                            email + "@prolox.store",
                            password
                          )
                          .then((x) => {
                            this.db
                              .child("staff/data/" + email)
                              .set({ email: x.user.email, userName })
                              .then(() => {
                                this.db
                                  .child("staff/active/" + email)
                                  .set(email)
                                  .then(async () => {
                                    this.props.closeToast();
                                    await setTimeout(() => {
                                      this.props.showTimedToast(
                                        "Sign Up Successful"
                                      );
                                      this.props.authorizeUser();
                                      logEvent(
                                        userName +
                                          " user's account was created Successfully. Registered under email " +
                                          x.user.email,
                                        "staff/" + email + "/"
                                      );
                                    }, 300);
                                  });
                                this.db
                                  .child("create/" + this.state.authCode)
                                  .set(null);
                              });
                          })
                          .catch((x) => {
                            this.setState({ enableEdit: true });
                            this.props.showTimedToast(
                              "Change your credentials and try again"
                            );
                          });
                      } else if (t._password !== t.password) {
                        this.props.showTimedToast("Password Mismatch");
                      } else {
                        this.props.showTimedToast("All Fields Are Required");
                      }
                    }, 200);
                  }}
                >
                  Sign Up
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
