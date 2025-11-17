
export const GetFile =async (screenshot: any) => {
    const urlStream = await fetch(screenshot);
    const arrayBuffer = await urlStream.arrayBuffer();
    const blob: any = new Blob([arrayBuffer]);
    const file = new File([blob], "kresus.png", { type: "image/png" });
    return file
}

export const getMobileOS = () => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
        return "Android"
    }
    else if (/iPad|iPhone|iPod/.test(ua)
     || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)){
        return "iOS"
    }
    return "Other"
}