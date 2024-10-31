// const getUserDevice = () => {
//     return navigator.userAgent.includes('Eyejack') ? 'iOS' : 'Android'
// }

export const getOS = () => {
    const userAgent = window.navigator.userAgent;
    const platform =
      // window.navigator?.userAgentData?.platform ||
      window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    let os = '';
  
    if (macosPlatforms.indexOf(platform) !== -1) {
      //ipad pro get reported as MacIntel
      if (
        platform === 'MacIntel' &&
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2
      )
        os = 'iOS';
      else os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
      os = 'Linux';
    }
  
    return os;
  };
  

  export const isMobile = getOS() === 'iOS' || getOS() === 'Android'

