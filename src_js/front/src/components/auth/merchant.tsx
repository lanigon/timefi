import { useState, useEffect } from 'react';

export function useIsMerchant() {
  const [isMerchant, setIsMerchant] = useState(false);

  useEffect(() => {
    // 这里可以加入你的逻辑来判断是否是 merchant
    // 例如可以通过 API 请求，或一些复杂条件判断
    const someCondition = true; // 假设条件

    setIsMerchant(someCondition);
  }, []);

  return isMerchant;
}
