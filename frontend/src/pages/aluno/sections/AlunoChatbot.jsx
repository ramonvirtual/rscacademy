/**
 * AlunoChatbot — Assistente IA com RAG por disciplina
 * Respostas baseadas nos documentos oficiais que o professor cadastrou
 */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../hooks/useApi';

const initials = n => n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();

export default function AlunoChatbot() {
  const { user } = useAuth();
  const [msgs, setMsgs]           = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState(null);
  const [disciplinas, setDiscs]   = useState([]);
  const [discId, setDiscId]       = useState('');
  const [discNome, setDiscNome]   = useState('');
  const [loadingDiscs, setLdDiscs] = useState(true);
  const [showRag, setShowRag]     = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Nome sem títulos
  const TITULOS = ['prof.','dr.','dra.','ms.'];
  const partes  = user.nome.split(' ');
  const firstName = partes.find(p => !TITULOS.includes(p.toLowerCase())) || partes[0];

  useEffect(() => {
    api.get('/chatbot/disciplinas')
      .then(r => {
        const d = r.data.disciplinas || [];
        setDiscs(d);
        if (d.length > 0) { setDiscId(String(d[0].id)); setDiscNome(d[0].nome); }
      })
      .catch(() => {})
      .finally(() => setLdDiscs(false));
  }, []);

  useEffect(() => {
    const disc = discId ? disciplinas.find(d => String(d.id) === discId) : null;
    const nome = disc?.nome || '';
    setDiscNome(nome);
    setMsgs([{
      role: 'bot',
      text: `Olá, ${firstName}! 👋 Sou o **Assistente de IA** da RSC Academy.\n\n` +
        (nome
          ? `📚 Estou pronto para responder sobre **${nome}** com base nos documentos oficiais cadastrados pelo seu professor.\n\nExemplos do que posso ajudar:\n• Explicar conceitos da disciplina\n• Tirar dúvidas de atividades\n• Preparar para avaliações\n• Citar legislações e diretrizes relevantes`
          : `Para respostas mais precisas, **selecione uma disciplina** acima.\n\nPosso ajudar com dúvidas gerais sobre o conteúdo estudado.`
        ),
      fontes: [],
    }]);
  }, [discId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const historico = msgs
    .filter(m => m.role !== 'system')
    .slice(-10)
    .map(m => ({ role: m.role==='bot'?'assistant':'user', content: m.text }));

  async function send(texto) {
    const msg = (texto || input).trim();
    if (!msg || loading) return;
    setInput(''); setErro(null);
    setMsgs(prev => [...prev, { role:'user', text:msg }]);
    setLoading(true);
    try {
      const res = await api.post('/chatbot/mensagem', {
        mensagem:     msg,
        historico:    historico.slice(-6),
        disciplina_id: discId ? Number(discId) : undefined,
      });
      setMsgs(prev => [...prev, {
        role: 'bot',
        text: res.data.resposta,
        fontes: res.data.fontes || [],
        total_contextos: res.data.total_contextos || 0,
      }]);
    } catch(e) {
      setErro(e.response?.data?.error || 'Erro ao conectar com a IA.');
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const SUGESTOES_BASE = [
    'Quais são os principais conceitos desta disciplina?',
    'Explique com um exemplo prático',
    'Quais documentos oficiais embasam este conteúdo?',
    'Como isso se aplica na prática profissional?',
    'Resuma os pontos mais importantes',
  ];

  const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} style={{ margin:0, lineHeight:1.7, minHeight:line?'auto':'8px' }} dangerouslySetInnerHTML={{ __html:bold||'&nbsp;' }} />;
    });
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',height:'calc(100vh - 8rem)',background:'white',borderRadius:16,border:'1px solid var(--slate-200)',overflow:'hidden',boxShadow:'var(--shadow)' }}>

      {/* Header com seletor de disciplina */}
      <div style={{ padding:'1rem 1.25rem',borderBottom:'1px solid var(--slate-100)',background:'linear-gradient(135deg,var(--navy),var(--navy-mid))',color:'white' }}>
        <div style={{ display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
          <div style={{ width:40,height:40,borderRadius:10,background:'rgba(255,255,255,.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>🤖</div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-head)',fontSize:15,fontWeight:700 }}>Assistente de IA</div>
            <div style={{ fontSize:11,opacity:.6 }}>
              {discNome ? `Baseado nos documentos de ${discNome}` : 'Selecione uma disciplina para respostas precisas'}
            </div>
          </div>

          {/* Seletor de disciplina */}
          {!loadingDiscs && (
            <div style={{ display:'flex',alignItems:'center',gap:8 }}>
              {disciplinas.length > 0 ? (
                <select value={discId} onChange={e=>{setDiscId(e.target.value);}}
                  style={{ padding:'6px 12px',borderRadius:8,border:'1px solid rgba(255,255,255,.2)',background:'rgba(255,255,255,.1)',color:'white',fontSize:12,outline:'none',cursor:'pointer',maxWidth:200 }}>
                  <option value="" style={{ color:'var(--navy)' }}>Sem disciplina</option>
                  {disciplinas.map(d=><option key={d.id} value={d.id} style={{ color:'var(--navy)' }}>{d.nome} ({d.total_contextos||d.total_docs||0} trechos)</option>)}
                </select>
              ) : (
                <span style={{ fontSize:11,opacity:.6,fontStyle:'italic' }}>Nenhum documento RAG cadastrado</span>
              )}
              <button onClick={()=>setShowRag(s=>!s)} title="Sobre o RAG"
                style={{ background:'rgba(255,255,255,.12)',border:'none',color:'white',borderRadius:7,padding:'5px 10px',cursor:'pointer',fontSize:11 }}>
                {showRag?'▲':'ℹ️'} RAG
              </button>
            </div>
          )}
        </div>

        {/* Painel RAG info */}
        {showRag && (
          <div style={{ marginTop:10,padding:'10px 12px',background:'rgba(255,255,255,.08)',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',fontSize:11,lineHeight:1.6 }}>
            <strong>O que é RAG?</strong> Retrieval-Augmented Generation — o sistema busca os trechos mais relevantes dos documentos oficiais cadastrados pelo professor e os injeta no contexto da IA antes de responder. Isso garante respostas baseadas em fontes reais e verificáveis, não apenas no conhecimento geral do modelo.
          </div>
        )}
      </div>

      {/* Mensagens */}
      <div style={{ flex:1,overflowY:'auto',padding:'1rem',display:'flex',flexDirection:'column',gap:12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:'flex',gap:10,alignItems:'flex-start',flexDirection:m.role==='user'?'row-reverse':'row' }}>
            {/* Avatar */}
            <div style={{ width:34,height:34,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:m.role==='bot'?18:13,fontWeight:700,background:m.role==='bot'?'linear-gradient(135deg,var(--emerald),var(--emerald-dark))':'linear-gradient(135deg,var(--navy),var(--navy-mid))',color:'white' }}>
              {m.role==='bot'?'🤖':initials(user.nome)}
            </div>

            <div style={{ maxWidth:'75%', display:'flex', flexDirection:'column', gap:4, alignItems:m.role==='user'?'flex-end':'flex-start' }}>
              <div style={{ background:m.role==='user'?'linear-gradient(135deg,var(--navy),var(--navy-mid))':'var(--slate-50)', color:m.role==='user'?'white':'var(--slate-800)', borderRadius:m.role==='user'?'16px 4px 16px 16px':'4px 16px 16px 16px', padding:'10px 14px', fontSize:13.5, lineHeight:1.6, border:m.role==='bot'?'1px solid var(--slate-200)':'none', boxShadow:'0 2px 6px rgba(0,0,0,.07)' }}>
                {renderText(m.text)}
              </div>

              {/* Fontes RAG */}
              {m.role==='bot' && m.fontes?.length > 0 && (
                <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginTop:2 }}>
                  <span style={{ fontSize:10,color:'var(--slate-400)' }}>Baseado em:</span>
                  {m.fontes.map((f,j) => (
                    <span key={j} style={{ fontSize:10,padding:'2px 8px',borderRadius:50,background:'rgba(16,185,129,.08)',color:'var(--emerald-dark)',border:'1px solid rgba(16,185,129,.2)',fontWeight:500 }}>
                      📄 {f}
                    </span>
                  ))}
                </div>
              )}
              {m.role==='bot' && m.total_contextos === 0 && i > 0 && (
                <span style={{ fontSize:10,color:'var(--slate-400)',fontStyle:'italic' }}>Resposta do conhecimento geral da IA (sem documentos locais)</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:'flex',gap:10,alignItems:'flex-start' }}>
            <div style={{ width:34,height:34,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--emerald),var(--emerald-dark))' }}>🤖</div>
            <div style={{ background:'var(--slate-50)',border:'1px solid var(--slate-200)',borderRadius:'4px 16px 16px 16px',padding:'12px 16px',display:'flex',alignItems:'center',gap:8 }}>
              <div className="spinner" style={{ width:16,height:16,borderWidth:2,margin:0 }} />
              <span style={{ fontSize:13,color:'var(--slate-500)' }}>
                {discNome ? `Consultando documentos de ${discNome}...` : 'Gerando resposta...'}
              </span>
            </div>
          </div>
        )}

        {erro && (
          <div className="alert alert-error" style={{ margin:'0 1rem' }}>
            ⚠️ {erro}
            <button onClick={() => setErro(null)} style={{ marginLeft:8,background:'none',border:'none',cursor:'pointer',fontSize:12,color:'inherit' }}>✕</button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Sugestões (só quando poucas mensagens) */}
      {msgs.length <= 1 && (
        <div style={{ padding:'0 1rem 0.75rem',display:'flex',gap:6,flexWrap:'wrap' }}>
          {SUGESTOES_BASE.map((s,i) => (
            <button key={i} onClick={()=>send(s)} style={{ padding:'5px 12px',borderRadius:50,border:'1px solid var(--slate-200)',background:'white',cursor:'pointer',fontSize:12,color:'var(--slate-600)',transition:'all .15s' }}
              onMouseEnter={e=>{e.target.style.borderColor='var(--emerald)';e.target.style.color='var(--emerald-dark)';}}
              onMouseLeave={e=>{e.target.style.borderColor='var(--slate-200)';e.target.style.color='var(--slate-600)';}}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:'0.875rem 1rem',borderTop:'1px solid var(--slate-100)',display:'flex',gap:10,alignItems:'flex-end',background:'white' }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
          placeholder={discNome ? `Pergunte sobre ${discNome}... (Enter para enviar)` : 'Digite sua dúvida... (Enter para enviar)'}
          rows={1}
          style={{ flex:1,resize:'none',padding:'10px 14px',border:'1.5px solid var(--slate-200)',borderRadius:12,fontFamily:'var(--font-body)',fontSize:14,outline:'none',lineHeight:1.5,maxHeight:120,overflow:'auto' }}
          onFocus={e=>e.target.style.borderColor='var(--emerald)'}
          onBlur={e=>e.target.style.borderColor='var(--slate-200)'}
        />
        <button onClick={()=>send()} disabled={!input.trim()||loading}
          style={{ width:44,height:44,borderRadius:12,background:input.trim()&&!loading?'linear-gradient(135deg,var(--emerald),var(--emerald-dark))':'var(--slate-200)',color:input.trim()&&!loading?'white':'var(--slate-400)',border:'none',cursor:input.trim()&&!loading?'pointer':'not-allowed',fontSize:18,flexShrink:0,transition:'all .15s',boxShadow:input.trim()&&!loading?'0 3px 10px rgba(16,185,129,.3)':'none' }}>
          ➤
        </button>
      </div>
    </div>
  );
}
