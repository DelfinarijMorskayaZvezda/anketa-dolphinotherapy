import { createVKBridge } from '@vkontakte/vk-bridge'

const bridge = createVKBridge()

bridge.send('VKWebAppInit', {})

export default bridge
