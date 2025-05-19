interface Tokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export const AuthService = {
  setTokens(tokens: Tokens, user_type: string) {
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("token_type", tokens.token_type);
    localStorage.setItem("user_type", user_type);
  },

  getAccessToken() {
    return localStorage.getItem("access_token");
  },

  getRefreshToken() {
    return localStorage.getItem("refresh_token");
  },

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_type");
  },

  getUserType() {
    return localStorage.getItem("user_type");
  },
};
