const axios = require("axios");
var cookies = require("vue-cookie");


axios.interceptors.request.use(
  (config) => {
    let authorization = cookies.get("authorization");
    if (authorization !== "") {
      config.headers["authorization"] = "Bearer " + authorization;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

let config = {}

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      if (error.response.status === 401) {
        let href = window.location.href;
        if (
          href.indexOf("/login") !== -1 || href.indexOf("/jsonSchemaGenerator") !== -1
        ) {
          return Promise.reject(error.response.data);
        } else {
          window.location = "#/login";
        }
      } else {
        if (error.response.data) {
          return Promise.reject(error.response.data);
        }
      }
    }
    return Promise.reject(error);
  }
);


function set_strapi_url(strapiurl){
  window.url = strapiurl
  config.url = strapiurl
}

function myInfo(resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .get(`${config.url}/admin/users/me`)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function login(email, password, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .post(`${config.url}/admin/login`, {
      "email": email,
      "password": password
    })
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function refresh_token(resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let authorization = cookies.get("authorization");
  if (!authorization) {
    window.location = "#/login";
  } else {
    axios.post(`${config.url}/admin/renew-token`, {
      "token": authorization,
    })
      .then((resp) => {
        let new_token = resp.data.data.token
        cookies.set("authorization", new_token, 6);
        resolve(resp.data)
      })
      .catch((err) => reject(err));
  }


}

function get_content_init(resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .get(`${config.url}/content-manager/init`)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_content_configuration(model, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .get(`${config.url}/content-manager/content-types/${model}/configuration`)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_content_list(model, sort_by, sort_order, page, pageCount, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/content-manager/collection-types/${model}?page=${page}&pageSize=${pageCount}`
  if (sort_by) {
    url = `${url}&sort=${sort_by}:${sort_order}`
  }

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function delete_content_by_id(model, id, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .delete(`${config.url}/content-manager/collection-types/${model}/${id}`)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function upload(folder, filename, file, progress, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  progress = progress || function () { }

  let formData = new FormData();
  formData.append("fileInfo", JSON.stringify({ name: filename, folder: folder }))
  formData.append("files", file)

  axios
    .post(`${config.url}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress(progressEvent) {
        progress(progressEvent.loaded / progressEvent.total, progressEvent.loaded, progressEvent.total)
      }
    })
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function save_model_data(model, modeldata, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/content-manager/collection-types/${model}`

  axios
    .post(url, modeldata)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_content_by_id(model, id, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };

  let url = `${config.url}/content-manager/single-types/${model}`
  if (id) {
    url = `${config.url}/content-manager/collection-types/${model}/${id}`
  }
  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function update_content_by_id(model, id, modeldata, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .put(`${config.url}/content-manager/collection-types/${model}/${id}`, modeldata)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}


function publish_content(model, id, publish, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  axios
    .post(`${config.url}/content-manager/collection-types/${model}/${id}/actions/${publish ? 'publish' : 'unpublish'}`)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_ralation_list(model, field, entityId, page, pageCount, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/content-manager/relations/${model}/${field}?&pageSize=${pageCount}&_q=&_filter=$startsWithi&page=${page}`
  if (entityId) {
    url = `${url}&entityId=${entityId}`
  }

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_ralation_list_by_id(model, field, entityId, page, pageCount, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/content-manager/relations/${model}/${entityId}/${field}?pageSize=${pageCount}&page=${page}`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_permissions(resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/admin/users/me/permissions`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function search_folders(parentid, serch_word, page, pageCount, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/upload/folders?sort=createdAt:DESC&page=${page}&pageSize=${pageCount}&pagination[pageSize]=-1`
  if (parentid === undefined) {
    url += "&filters[$and][0][parent][id][$null]=true"
  } else {
    url += `&filters[$and][0][parent][id]=${parentid}`
  }

  if (serch_word) {
    url += `&_q=${serch_word}`
  }

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function create_folder(parentid, name, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };

  axios
    .post(`${config.url}/upload/folders/`, {
      name: name,
      parent: parentid
    })
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function list_files_with_related(parentpath, page, pageCount, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/upload/files?sort=createdAt:DESC&page=${page}&pageSize=${pageCount}&filters[$and][0][folderPath][$eq]=${parentpath}&populate[related][fields][0]=id&&populate[folder][fields][0]=id&fields[0]=name&fields[1]=url&fields[2]=formats&fields[3]=mime&fields[4]=folderPath`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function list_folders(parentid, page, pageCount, resolve, reject) {
  search_folders(parentid, undefined, page, pageCount, resolve, reject)
}


function list_files(parentpath, page, pageCount, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/upload/files?sort=createdAt:DESC&page=${page}&pageSize=${pageCount}&filters[$and][0][folderPath][$eq]=${parentpath}`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function get_folder_by_id(folderid, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/upload/folders/${folderid}`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function delete_by_id(fileid, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/upload/files/${fileid}`

  axios
    .delete(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function folder_structure(resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${config.url}/upload/folder-structure`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

function check_strapi_url(strapiurl, resolve, reject) {
  resolve = resolve || function () { };
  reject = reject || function () { };
  let url = `${strapiurl}/admin/init`

  axios
    .get(url)
    .then((resp) => resolve(resp.data))
    .catch((err) => reject(err));
}

export {
  set_strapi_url,
  myInfo,
  login,
  refresh_token,
  get_content_init,
  get_content_configuration,
  get_content_list,
  delete_content_by_id,
  get_content_by_id,
  upload,
  save_model_data,
  update_content_by_id,
  publish_content,
  get_ralation_list,
  get_ralation_list_by_id,
  get_permissions,
  search_folders,
  list_folders,
  create_folder,
  list_files_with_related,
  list_files,
  get_folder_by_id,
  delete_by_id,
  folder_structure,
  check_strapi_url
};
