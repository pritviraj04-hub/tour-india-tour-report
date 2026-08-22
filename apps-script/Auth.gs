var AuthService = {
  /*
   * The frontend is hosted on GitHub, so the Apps Script web app must not
   * trust the browser's Google login state by itself.
   *
   * This foundation uses an authorized-email configuration. Before production,
   * connect Google Identity Services and pass a Google ID token to this endpoint.
   * The verification helper below is ready for that integration.
   */

  requireUser: function() {
    var email = this.resolveUserEmail_();
    if (!email) {
      var err = new Error('Authentication required.');
      err.code = 'AUTH_REQUIRED';
      throw err;
    }

    var allowed = AppConfig.authorizedUsers();
    if (allowed.indexOf(email.toLowerCase()) === -1) {
      var denied = new Error('Access Denied');
      denied.code = 'ACCESS_DENIED';
      throw denied;
    }

    return {email: email, authorized: true};
  },

  resolveUserEmail_: function() {
    // If this Web App is configured to execute as the user accessing it,
    // Apps Script may provide the active user email. Do not assume this
    // works for every external-web deployment.
    var email = '';
    try {
      email = Session.getActiveUser().getEmail() || '';
    } catch (_) {}
    return email;
  },

  verifyGoogleIdToken: function(idToken) {
    if (!idToken) throw new Error('Missing Google ID token.');

    var response = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      {muteHttpExceptions:true}
    );

    if (response.getResponseCode() !== 200) {
      var err = new Error('Invalid Google identity token.');
      err.code = 'AUTH_REQUIRED';
      throw err;
    }

    var data = JSON.parse(response.getContentText());
    var clientId = AppConfig.googleClientId();

    if (clientId && data.aud !== clientId) {
      var audErr = new Error('Invalid token audience.');
      audErr.code = 'AUTH_REQUIRED';
      throw audErr;
    }

    if (data.email_verified !== 'true') {
      var verErr = new Error('Google email is not verified.');
      verErr.code = 'AUTH_REQUIRED';
      throw verErr;
    }

    return {
      email: String(data.email || '').toLowerCase(),
      name: data.name || '',
      picture: data.picture || ''
    };
  }
};
