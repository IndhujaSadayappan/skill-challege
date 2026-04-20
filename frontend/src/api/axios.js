import axios from "axios";

axios.defaults.baseURL = `${"http://13.232.214.235:5000"}/api`;

axios.defaults.withCredentials = true; // IMPORTANT: send cookies for all requests

export default axios;
