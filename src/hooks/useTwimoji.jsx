import { useEffect } from "react";
import twemoji from "twemoji";

const useTwemoji = (ref) => {
  useEffect(() => {
    if (ref.current) {
      twemoji.parse(ref.current, { folder: "svg", ext: ".svg" });
    }
  }, [ref]);
};

export default useTwemoji;
