// 甯搁┗銆屽畬鎴愭彁閱掋€嶆彃浠讹紙瀹夸富渚э級鈥斺€旈厤缃蛋鏍囧噯 settings 鍛藉悕绌洪棿锛坰ettings.yaml锛?// 閫氱煡锛氱洃鍚疆娆＄粨鏉?-> 瓒呴槇鍊?-> 鎸夋ā鏉挎覆鏌?-> 鎺ㄩ€侊紙鍦板潃鍙嚜瀹氫箟锛?// 妯℃澘鍗犱綅绗︼細{turn} {time} {minutes} {preview}(涓婃潯鍥炲鎽樺綍) {ai}(AI鎬荤粨)
// 閰嶇疆锛氭祻瑙堝櫒 UI 閫氳繃 GET/POST /api/band-notify/config 璇诲啓 settings 鍛藉悕绌洪棿
import { appendFileSync } from 'node:fs'
import z from '@deepseek-ai/schemastery'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import { createUserMessage } from '@deepseek-ai/dsh-llm'

const DEFAULT_URL = 'https://ntfy.sh/你的频道'
const DEFAULT_TEMPLATE = '绗?{turn} 杞璇濆凡瀹屾垚 ({time}) 路 鐢ㄦ椂 {minutes} 鍒嗛挓'
const DEFAULT_TITLE = '瀵硅瘽宸茬粨鏉?
const HEARTBEAT_PATH = 'C:/Users/24251/.dsh/band-notify-heartbeat.log'
const NS = settingsNamespace('band-notify')

const DEFAULT_CONFIG = { enabled: true, minMinutes: 0, endpoint: DEFAULT_URL, template: DEFAULT_TEMPLATE, titleTemplate: DEFAULT_TITLE, format: 'ntfy', jsonTemplate: '', aiSummary: false }

const Config = z.object({
  enabled: z.boolean().default(true),
  minMinutes: z.number().min(0).default(0),
  endpoint: z.string().default(DEFAULT_URL),
  template: z.string().default(DEFAULT_TEMPLATE),
  titleTemplate: z.string().default(DEFAULT_TITLE),
  format: z.union(['ntfy', 'text', 'json']).default('ntfy'),
  jsonTemplate: z.string().default(''),
  aiSummary: z.boolean().default(false),
})

function beat(line) {
  try {
    appendFileSync(HEARTBEAT_PATH, new Date().toISOString() + ' ' + line + '\n')
  } catch {}
}

// 浠庝細璇濅簨浠堕噷鍙栨渶鍚庝竴鏉?assistant 娑堟伅鐨勭函鏂囨湰
function lastAssistantText(agent) {
  try {
    const session = agent && agent.session
    const events = session && session.events
    if (!events) return ''
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i]
      if (ev && ev.type === 'assistant/message') {
        const msg = ev.data && ev.data.message
        const blocks = msg && msg.content
        if (Array.isArray(blocks)) {
          let text = ''
          for (const b of blocks) {
            if (b && b.type === 'text' && typeof b.text === 'string') text += b.text
          }
          text = text.replace(/\s+/g, ' ').trim()
          if (text) return text
        }
      }
    }
  } catch {}
  return ''
}

function previewOf(text, max) {
  if (!text) return ''
  return text.length > max ? text.slice(0, max) + '鈥? : text
}

// AI 鎬荤粨锛氳皟 llm.stream锛屼换浣曞け璐ヨ繑鍥?''
async function aiSummaryOf(ctx, text) {
  try {
    const llm = ctx.get('llm')
    const adm = ctx.get('agentDefaultModel')
    if (llm === undefined || adm === undefined) return ''
    const sel = adm.currentSelection()
    if (!sel || !sel.provider || !sel.model) return ''
    const msg = createUserMessage({
      content: [{ type: 'text', text: '鐢ㄤ笉瓒呰繃12涓瓧鎬荤粨涓嬮潰杩欐璇濓紝鐩存帴杈撳嚭鎬荤粨鍐呭锛屼笉瑕佸紩鍙蜂笉瑕佽В閲婏細\n' + text }],
      source: { kind: 'user' },
    })
    let out = ''
    for await (const chunk of llm.stream({ provider: sel.provider, model: sel.model, messages: [msg] })) {
      if (!chunk) continue
      const t = typeof chunk.text === 'string' ? chunk.text
        : (chunk.delta && typeof chunk.delta.text === 'string') ? chunk.delta.text
        : (chunk.delta && typeof chunk.delta.content === 'string') ? chunk.delta.content
        : (typeof chunk.content === 'string') ? chunk.content
        : ''
      if (t) out += t
    }
    return out.trim().slice(0, 40)
  } catch (e) {
    beat('ai summary error: ' + (e && e.message ? e.message : String(e)))
    return ''
  }
}

function renderBody(template, vars) {
  let s = template || DEFAULT_TEMPLATE
  for (const k of Object.keys(vars)) {
    s = s.split('{' + k + '}').join(String(vars[k] ?? ''))
  }
  return s.replace(/\s+/g, ' ').trim()
}

const SENDER = [
  "const http = require('http');",
  "const https = require('https');",
  "const u = new URL(process.env.NTFY_URL || 'https://ntfy.sh/你的频道');",
  "const format = process.env.NTFY_FORMAT || 'ntfy';",
  "const title = process.env.NTFY_TITLE || 'DSH';",
  "const message = process.env.NTFY_BODY || '';",
  "const priority = Number(process.env.NTFY_PRIORITY || '3');",
  "const mod = u.protocol === 'http:' ? http : https;",
  "const port = u.port || (u.protocol === 'http:' ? 80 : 443);",
  "let path = u.pathname + u.search;",
  "let headers;",
  "let payload;",
  "if (format === 'json') {",
  "  const tpl = process.env.NTFY_JSON_TEMPLATE || '{\"title\":{title},\"body\":{body}}';",
  "  const esc = (v) => JSON.stringify(v).slice(1, -1);",
  "  let j = tpl;",
  "  j = j.split('\"{title}\"').join('\"' + esc(title) + '\"').split('{title}').join(JSON.stringify(title));",
  "  j = j.split('\"{body}\"').join('\"' + esc(message) + '\"').split('{body}').join(JSON.stringify(message));",
  "  j = j.split('\"{priority}\"').join('\"' + String(priority) + '\"').split('{priority}').join(String(priority));",
  "  payload = Buffer.from(j, 'utf8');",
  "  headers = { 'Content-Type': 'application/json', 'Content-Length': payload.length };",
  "} else if (format === 'text') {",
  "  payload = Buffer.from(message, 'utf8');",
  "  headers = { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': payload.length };",
  "} else {",
  "  const sep = u.search ? '&' : '?';",
  "  path = u.pathname + u.search + sep + 'title=' + encodeURIComponent(title) + '&priority=' + priority;",
  "  payload = Buffer.from(message, 'utf8');",
  "  headers = { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Length': payload.length };",
  "}",
  "const req = mod.request({ hostname: u.hostname, port: port, path: path, method: 'POST', rejectUnauthorized: false, headers: headers }, function (res) { res.resume(); });",
  "req.setTimeout(15000, function () { req.destroy(); });",
  "req.on('error', function () {});",
  "req.write(payload);",
  "req.end();",
].join('\n')

export default {
  name: 'band-notify',
  apply(ctx) {
    const agents = ctx.get('agents')

    let source = () => DEFAULT_CONFIG
    try {
      installSettingsSection(ctx, NS, Config, DEFAULT_CONFIG, {
        setSource: (fn) => { source = fn },
        onChange: () => {},
      })
    } catch (e) {
      beat('settings install error: ' + (e && e.message ? e.message : String(e)))
    }

    const readConfig = () => {
      try {
        const v = source()
        return {
          enabled: v && typeof v.enabled === 'boolean' ? v.enabled : true,
          minMinutes: v && typeof v.minMinutes === 'number' && v.minMinutes >= 0 ? Math.round(v.minMinutes * 10) / 10 : 0,
          endpoint: v && typeof v.endpoint === 'string' && /^https?:\/\//i.test(v.endpoint) ? v.endpoint : DEFAULT_URL,
          template: v && typeof v.template === 'string' && v.template ? v.template : DEFAULT_TEMPLATE,
          titleTemplate: v && typeof v.titleTemplate === 'string' && v.titleTemplate ? v.titleTemplate : DEFAULT_TITLE,
          format: v && (v.format === 'text' || v.format === 'json') ? v.format : 'ntfy',
          jsonTemplate: v && typeof v.jsonTemplate === 'string' ? v.jsonTemplate : '',
          aiSummary: v && typeof v.aiSummary === 'boolean' ? v.aiSummary : false,
        }
      } catch (e) {
        beat('readConfig error: ' + (e && e.message ? e.message : String(e)))
        return { ...DEFAULT_CONFIG }
      }
    }

    const writeConfig = (patch) => {
      const cur = readConfig()
      const next = {
        enabled: typeof patch.enabled === 'boolean' ? patch.enabled : cur.enabled,
        minMinutes: typeof patch.minMinutes === 'number' && patch.minMinutes >= 0 ? Math.round(patch.minMinutes * 10) / 10 : cur.minMinutes,
        endpoint: typeof patch.endpoint === 'string' && /^https?:\/\//i.test(patch.endpoint) ? patch.endpoint : cur.endpoint,
        template: typeof patch.template === 'string' && patch.template ? patch.template : cur.template,
        titleTemplate: typeof patch.titleTemplate === 'string' && patch.titleTemplate ? patch.titleTemplate : cur.titleTemplate,
        format: patch.format === 'text' || patch.format === 'json' ? patch.format : cur.format,
        jsonTemplate: typeof patch.jsonTemplate === 'string' ? patch.jsonTemplate : cur.jsonTemplate,
        aiSummary: typeof patch.aiSummary === 'boolean' ? patch.aiSummary : cur.aiSummary,
      }
      const settings = ctx.get('settings')
      if (settings !== undefined) {
        return settings.replace(NS, next).then(() => next).catch((e) => {
          beat('settings write error: ' + (e && e.message ? e.message : String(e)))
          return next
        })
      }
      return Promise.resolve(next)
    }

    // 閰嶇疆 HTTP 璺敱锛堟祻瑙堝櫒 UI 璇诲啓鍚屼竴鍛藉悕绌洪棿锛?    const webServer = ctx.get('webServer')
    if (webServer !== undefined) {
      try {
        webServer.register({
          kind: 'exact',
          path: '/api/band-notify/config',
          handler(req, res) {
            try {
              if (req.method === 'GET') {
                res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
                res.end(JSON.stringify(readConfig()))
                return
              }
              if (req.method === 'POST' || req.method === 'PUT') {
                let body = ''
                req.on('data', (c) => { body += c })
                req.on('end', () => {
                  try {
                    const patch = JSON.parse(body || '{}')
                    writeConfig(patch).then((next) => {
                      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
                      res.end(JSON.stringify(next))
                    })
                  } catch {
                    res.writeHead(400, { 'content-type': 'text/plain' })
                    res.end('bad json')
                  }
                })
                return
              }
              res.writeHead(405)
              res.end()
            } catch (e) {
              beat('route error: ' + (e && e.message ? e.message : String(e)))
              res.writeHead(500)
              res.end('internal error')
            }
          },
        })
      } catch (e) {
        beat('route register error: ' + (e && e.message ? e.message : String(e)))
      }
    }

    const isRootAgent = (agent) => {
      if (agents === undefined) return true
      const id = agent && agent.id
      if (id === undefined || id === null) return true
      return agents.roots().some((a) => a && a.id === id)
    }
    const startKey = (agent, turn) => (agent && agent.id) + ':' + turn
    const starts = new Map()

    ctx.on('agent/inbox/claimed', (payload) => {
      try {
        if (!payload || !isRootAgent(payload.agent)) return
        starts.set(startKey(payload.agent, payload.turn), Date.now())
      } catch {}
    })

    ctx.on('agent/turn-stopping', (payload) => {
      try {
        beat('turn-stopping received, turn=' + (payload && payload.turn))
        const cfg = readConfig()
        if (!cfg.enabled) { beat('skipped: disabled'); return }
        if (payload && payload.signal && payload.signal.aborted) { beat('skipped: aborted'); return }
        if (!isRootAgent(payload.agent)) { beat('skipped: non-root agent'); return }
        const key = startKey(payload.agent, payload.turn)
        const started = starts.get(key)
        starts.delete(key)
        let mins = null
        if (started !== undefined) mins = (Date.now() - started) / 60000
        if (cfg.minMinutes > 0 && (mins === null || mins < cfg.minMinutes)) { beat('skipped: under threshold'); return }

        const now = new Date()
        const hh = ('0' + now.getHours()).slice(-2)
        const mm = ('0' + now.getMinutes()).slice(-2)
        const text = lastAssistantText(payload.agent)
        const preview = previewOf(text, 20)
        const vars = {
          turn: payload.turn,
          time: hh + ':' + mm,
          minutes: mins === null ? '' : String(Math.round(mins * 10) / 10),
          preview: preview,
          ai: preview,
        }

        const send = (body) => {
          const title = renderBody(cfg.titleTemplate || DEFAULT_TITLE, vars)
          beat('sending: ' + body)
          ctx.subprocess.spawn({
            argv: ['D:\\nodejs\\node.exe', '-e', SENDER],
            cwd: 'F:\\trae1\\灏忕背鎵嬬幆10pro鑱旈€?,
            stdio: { stdin: 'ignore', stdout: { maxBytes: 4096 }, stderr: { maxBytes: 4096 } },
            graceMs: 5000,
            env: { NTFY_TITLE: title, NTFY_BODY: body, NTFY_PRIORITY: '3', NTFY_URL: cfg.endpoint, NTFY_FORMAT: cfg.format, NTFY_JSON_TEMPLATE: cfg.jsonTemplate },
          })
          beat('spawned')
        }

        if (cfg.aiSummary && text) {
          // fire-and-forget锛欰I 鎬荤粨瀹屾垚鍚庡彂閫侊紙澶辫触鍥為€€棰勮锛?          aiSummaryOf(ctx, text).then((s) => {
            vars.ai = s || preview
            send(renderBody(cfg.template, vars))
          })
        } else {
          send(renderBody(cfg.template, vars))
        }
      } catch (e) {
        beat('turn-stopping error: ' + (e && e.message ? e.message : String(e)))
      }
    })
  },
}
