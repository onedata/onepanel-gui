export default function (response) {
  if (response && response.headers && response.headers.location) {
    const match = response.headers.location.match(/^.*\/tasks\/(.*)$/);
    return match && match[1];
  } else {
    return undefined;
  }
}
