import { useId } from 'react'
import type { TrendStory } from '../trends'

export function EditorialArt({ kind }: { kind: TrendStory['artwork'] }) {
  const id = useId().replaceAll(':', '')
  return <svg className={`editorial-art art-${kind}`} viewBox="0 0 600 600" role="img" aria-label={`Original fashion illustration: ${kind === 'tailoring' ? 'relaxed blue tailoring' : kind === 'lilac' ? 'a lilac top and soft color palette' : 'pink accessories and a ribbon'}`}>
    <defs><linearGradient id={`${id}-bg`} x2="1" y2="1"><stop stopColor={kind === 'tailoring' ? '#d8dfe9' : kind === 'lilac' ? '#e5dbf0' : '#f0dbe2'} /><stop offset="1" stopColor="#fbf5ef" /></linearGradient><linearGradient id={`${id}-fabric`} x2="1" y2="1"><stop stopColor={kind === 'tailoring' ? '#8e9aaf' : '#b4a0d3'} /><stop offset="1" stopColor={kind === 'tailoring' ? '#59647a' : '#8c73b5'} /></linearGradient><filter id={`${id}-shadow`}><feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="#695366" floodOpacity=".16" /></filter></defs>
    <rect width="600" height="600" fill={`url(#${id}-bg)`} />
    <circle cx="460" cy="110" r="180" fill="#fff" opacity=".25" /><path d="M0 520 Q300 440 600 510 V600H0Z" fill="#fff" opacity=".32" />
    {kind === 'tailoring' ? <>
      <path d="M50 600V450H190V375H330V300H600V600Z" fill="#b5bfce" opacity=".55" />
      <path d="M62 450H190M190 375H330M330 300H600" stroke="#e8edf2" strokeWidth="3" />
      <g filter={`url(#${id}-shadow)`} transform="translate(45 3)">
        <path d="M255 510 225 569 196 574Q191 586 212 588H253L283 515M321 515 342 574 329 583H389Q397 573 377 569L351 505" fill="#484151" />
        <path d="M236 322 222 522 280 531 303 386 313 523 368 516 344 315Z" fill="#eee2d1" /><path d="M302 367 284 525" fill="none" stroke="#dac9b0" strokeWidth="4" />
        <path d="M244 144 192 175 166 296 194 309 235 224 225 353Q300 382 365 345L348 224 379 307 405 291 378 178 330 144Z" fill={`url(#${id}-fabric)`} />
        <path d="M271 143 253 171 288 270 315 167 307 143Z" fill="#f9f1e5" /><path d="M259 142 235 194 267 224 257 249 290 294 274 347M318 142 350 194 320 222 334 247 295 294 291 363" fill="none" stroke="#bac3d2" strokeWidth="5" />
        <path d="M204 307 193 332Q197 343 207 332L217 309M383 303 391 332Q402 337 404 324L406 296" fill="#b98772" />
        <path d="M280 118V150Q295 173 313 147V112Z" fill="#bd8a74" /><ellipse cx="295" cy="88" rx="35" ry="46" fill="#d0a18a" /><path d="M260 104Q240 51 280 36 339 27 333 94L318 90 305 57Q274 76 260 73Z" fill="#4b3b38" />
        <path d="M190 301Q159 370 183 384H231Q257 364 231 313" fill="#9b7560" /><path d="M198 315Q215 284 229 315" fill="none" stroke="#6f5146" strokeWidth="7" />
        <circle cx="304" cy="298" r="4" fill="#e7dccd" />
      </g><text x="42" y="74" fill="#586477" fontFamily="Georgia,serif" fontSize="31" fontStyle="italic">a little structure,</text><text x="44" y="112" fill="#586477" fontFamily="Georgia,serif" fontSize="31" fontStyle="italic">a lot of ease.</text>
    </> : kind === 'lilac' ? <>
      <rect x="75" y="90" width="440" height="440" rx="180" fill="#f9f4fb" opacity=".55" />
      <g transform="rotate(-10 300 290)" filter={`url(#${id}-shadow)`}><path d="M230 165 147 199 114 281 184 304 222 248V404Q294 428 376 402V248L413 303 482 278 449 199 368 165 334 188H265Z" fill={`url(#${id}-fabric)`} /><path d="M266 166Q300 230 333 167" fill="none" stroke="#ddd0ec" strokeWidth="10" /><path d="M235 225 238 393M360 222 358 391" stroke="#d2c1e5" strokeWidth="3" opacity=".5" /></g>
      <circle cx="437" cy="479" r="32" fill="#7380a3" /><circle cx="500" cy="460" r="25" fill="#cfbddf" /><circle cx="382" cy="504" r="23" fill="#ede5ef" />
      <text x="56" y="72" fill="#79648f" fontFamily="Georgia,serif" fontSize="34" fontStyle="italic">soft looks good on you.</text><path d="M81 466Q111 425 141 458 119 487 107 505 89 486 81 466Z" fill="none" stroke="#b2a0ca" strokeWidth="3" />
    </> : <>
      <g transform="rotate(9 300 300)" filter={`url(#${id}-shadow)`}><path d="M200 272Q205 177 285 177 365 177 370 272" fill="none" stroke="#a87084" strokeWidth="16" /><path d="M179 261H390L413 449Q300 483 157 449Z" fill="#c78c9f" /><path d="M195 275H376" stroke="#eabcca" strokeWidth="5" /><rect x="255" y="323" width="57" height="37" rx="7" fill="#e8cdb0" /><path d="M274 332H294V351H274Z" fill="#b58292" /></g>
      <g transform="translate(386 123) rotate(15)"><path d="M0 41Q-92-34-100 44-83 107 0 52 92 101 102 32 82-32 0 41Z" fill="#ead0be" /><path d="M-2 49-52 176-12 165 7 192 20 64 45 177 72 154 93 165 30 46" fill="#ead0be" /><ellipse cx="8" cy="48" rx="18" ry="24" fill="#d7b6a0" /></g>
      <circle cx="116" cy="153" r="28" fill="none" stroke="#ba9360" strokeWidth="9" /><circle cx="155" cy="204" r="25" fill="none" stroke="#ba9360" strokeWidth="8" />
      <text x="61" y="545" fill="#9a627b" fontFamily="Georgia,serif" fontSize="36" fontStyle="italic">little things, big feelings.</text>
    </>}
    <path d="m520 345 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z" fill="#fff" opacity=".8" />
  </svg>
}
