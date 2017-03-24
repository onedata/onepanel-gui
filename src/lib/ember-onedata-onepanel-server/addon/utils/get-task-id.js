export default function (response) {
  if (response && response.headers && response.headers.location) {
    return response.headers.location.match(/^.*\/(.*)$/)[1];
  } else {
    return undefined;
  }
}
