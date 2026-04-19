import axios from "axios";

axios.defaults.baseURL = `${"http://3.6.91.209:5000"}/api`;

axios.defaults.withCredentials = true; // IMPORTANT: send cookies for all requests

export default axios;
