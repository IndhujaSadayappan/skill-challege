import axios from "axios";

axios.defaults.baseURL = `${"http://13.234.18.228:5000"}/api`;

axios.defaults.withCredentials = true; // IMPORTANT: send cookies for all requests

export default axios;
