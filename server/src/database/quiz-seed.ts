export interface QuizQuestionInput {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  grade: number;
  subject: 'math' | 'chinese' | 'science' | 'fun' | 'riddle';
  difficulty: 1 | 2 | 3;
}

function shuffleOptions(options: string[], correctIndex: number): { options: string[]; answer: number } {
  const correct = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return { options: shuffled, answer: shuffled.indexOf(correct) };
}

// 固定种子使每次生成一致
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateMathQuestions(grade: number, startIndex: number): QuizQuestionInput[] {
  const rng = seededRandom(grade * 1000 + startIndex);
  const rand = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const questions: QuizQuestionInput[] = [];

  if (grade === 1) {
    const templates = [
      () => { const a = rand(1, 9); const b = rand(1, 9 - a); const opts = [a + b, a + b + rand(1, 3), Math.abs(a + b - rand(1, 3)), rand(1, 5)]; return { q: `${a} + ${b} = ?`, o: [...new Set(opts)].slice(0, 4) as number[], a: a + b, e: `${a} + ${b} = ${a + b}` }; },
      () => { const a = rand(5, 18); const b = rand(1, a - 1); const opts = [a - b, a - b + rand(1, 3), Math.abs(a - b - rand(1, 3)), rand(1, 5)]; return { q: `${a} - ${b} = ?`, o: [...new Set(opts)].slice(0, 4) as number[], a: a - b, e: `${a} - ${b} = ${a - b}` }; },
    ];
    for (let i = 0; i < 35; i++) {
      const t = templates[i % templates.length]();
      while (t.o.length < 4) t.o.push(rand(1, 10));
      const { options, answer } = shuffleOptions(t.o.map(String), t.o.indexOf(t.a) >= 0 ? t.o.indexOf(t.a) : 0);
      questions.push({ question: t.q, options, answer, explanation: t.e, grade, subject: 'math', difficulty: 1 });
    }
  } else if (grade === 2) {
    for (let i = 0; i < 35; i++) {
      const a = rand(10, 99); const b = rand(1, Math.min(99 - a, 50));
      const correct = i % 2 === 0 ? a + b : a - rand(1, Math.min(a, 50));
      const op = i % 2 === 0 ? '+' : '-';
      const b2 = i % 2 === 0 ? b : a - correct;
      const q = i % 2 === 0 ? `${a} + ${b} = ?` : `${a} - ${b2} = ?`;
      const exp = i % 2 === 0 ? `${a} + ${b} = ${correct}` : `${a} - ${b2} = ${correct}`;
      const opts = new Set<number>([correct, correct + rand(1, 8), Math.abs(correct - rand(1, 8)), rand(1, 20)]);
      const optArr = [...opts].slice(0, 4);
      while (optArr.length < 4) optArr.push(rand(1, 99));
      const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
      questions.push({ question: q, options, answer, explanation: exp, grade, subject: 'math', difficulty: 1 });
    }
  } else if (grade === 3) {
    for (let i = 0; i < 35; i++) {
      if (i < 18) {
        const a = rand(2, 9); const b = rand(2, 9);
        const opts = new Set([a * b, a * b + rand(1, 5), Math.abs(a * b - rand(1, 5)), rand(1, 10)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 81));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(a * b));
        questions.push({ question: `${a} × ${b} = ?`, options, answer, explanation: `${a} × ${b} = ${a * b}`, grade, subject: 'math', difficulty: 1 });
      } else {
        const b = rand(2, 9); const c = rand(1, 9); const a = b * c;
        const opts = new Set([c, c + rand(1, 3), Math.abs(c - rand(1, 3)), rand(1, 10)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 9));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(c));
        questions.push({ question: `${a} ÷ ${b} = ?`, options, answer, explanation: `${a} ÷ ${b} = ${c}`, grade, subject: 'math', difficulty: 2 });
      }
    }
  } else if (grade === 4) {
    for (let i = 0; i < 35; i++) {
      if (i < 12) {
        const a = rand(100, 999); const b = rand(10, 999);
        const correct = i % 2 === 0 ? a + b : a - rand(1, a);
        const op = i % 2 === 0 ? '+' : '-';
        const b2 = i % 2 === 0 ? b : a - correct;
        const q = i % 2 === 0 ? `${a} + ${b} = ?` : `${a} - ${b2} = ?`;
        const exp = i % 2 === 0 ? `${a} + ${b} = ${correct}` : `${a} - ${b2} = ${correct}`;
        const opts = new Set([correct, correct + rand(1, 50), Math.abs(correct - rand(1, 50)), rand(100, 500)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 999));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
        questions.push({ question: q, options, answer, explanation: exp, grade, subject: 'math', difficulty: 2 });
      } else if (i < 22) {
        const a = rand(10, 99); const b = rand(2, 9);
        const opts = new Set([a * b, a * b + rand(1, 20), Math.abs(a * b - rand(1, 20)), rand(10, 500)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(100, 999));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(a * b));
        questions.push({ question: `${a} × ${b} = ?`, options, answer, explanation: `${a} × ${b} = ${a * b}`, grade, subject: 'math', difficulty: 2 });
      } else {
        const b = rand(2, 9); const c = rand(10, 50); const a = b * c;
        const opts = new Set([c, c + rand(1, 10), Math.abs(c - rand(1, 10)), rand(1, 50)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 99));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(c));
        questions.push({ question: `${a} ÷ ${b} = ?`, options, answer, explanation: `${a} ÷ ${b} = ${c}`, grade, subject: 'math', difficulty: 2 });
      }
    }
  } else if (grade === 5) {
    for (let i = 0; i < 35; i++) {
      if (i < 12) {
        const a = rand(1, 9); const b = rand(1, 9); const c = rand(1, 9);
        const correct = a * b + c;
        const opts = new Set([correct, correct + rand(1, 10), Math.abs(correct - rand(1, 10)), rand(10, 50)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 99));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
        questions.push({ question: `${a} × ${b} + ${c} = ?`, options, answer, explanation: `${a} × ${b} = ${a * b}, ${a * b} + ${c} = ${correct}`, grade, subject: 'math', difficulty: 2 });
      } else if (i < 20) {
        const n = rand(1, 9); const d = rand(2, 9);
        const decimal = (n / d).toFixed(2);
        const opts = new Set([decimal, (n / d + 0.1).toFixed(2), (n / d - 0.1).toFixed(2), (d / n).toFixed(2)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 9).toFixed(2));
        const { options, answer } = shuffleOptions(optArr, optArr.indexOf(decimal));
        questions.push({ question: `${n} ÷ ${d} 的近似值是？`, options, answer, explanation: `${n} ÷ ${d} ≈ ${decimal}`, grade, subject: 'math', difficulty: 2 });
      } else {
        const a = rand(1, 9); const b = rand(2, 9); const c = rand(2, 9); const d = rand(2, 9);
        const n1 = a * d + c * b; const d1 = b * d;
        const opts = new Set([`${n1}/${d1}`, `${a + c}/${b + d}`, `${a * c}/${b * d}`, `${a}/${d}`]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(`${rand(1, 9)}/${rand(1, 9)}`);
        const { options, answer } = shuffleOptions(optArr, optArr.indexOf(`${n1}/${d1}`));
        questions.push({ question: `${a}/${b} + ${c}/${d} = ?`, options, answer, explanation: `通分后：${a * d}/${b * d} + ${c * b}/${d * b} = ${n1}/${d1}`, grade, subject: 'math', difficulty: 3 });
      }
    }
  } else if (grade === 6) {
    for (let i = 0; i < 35; i++) {
      if (i < 12) {
        const total = rand(20, 200); const pct = [10, 20, 25, 30, 40, 50, 60, 75, 80][rand(0, 8)];
        const correct = Math.round(total * pct / 100);
        const opts = new Set([correct, correct + rand(1, 10), Math.abs(correct - rand(1, 10)), rand(1, total)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, total));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
        questions.push({ question: `${total} 的 ${pct}% 是多少？`, options, answer, explanation: `${total} × ${pct}% = ${total} × ${pct / 100} = ${correct}`, grade, subject: 'math', difficulty: 2 });
      } else if (i < 20) {
        const a = rand(2, 10); const b = rand(2, 10);
        const ratio = `${a}:${b}`;
        const opts = [`${a}:${b}`, `${b}:${a}`, `${a + 1}:${b}`, `${a}:${b + 1}`];
        const { options, answer } = shuffleOptions(opts, opts.indexOf(ratio));
        questions.push({ question: `将 ${a}/${b} 化成最简比：`, options, answer, explanation: `${a}/${b} = ${a}:${b}`, grade, subject: 'math', difficulty: 2 });
      } else {
        const r = rand(2, 5); const h = rand(3, 10);
        const volume = Math.round(Math.PI * r * r * h * 100) / 100;
        const opts = [`${volume.toFixed(1)}`, `${(volume * 1.5).toFixed(1)}`, `${(volume / 2).toFixed(1)}`, `${(Math.PI * r * h).toFixed(1)}`];
        const { options, answer } = shuffleOptions(opts, opts.indexOf(`${volume.toFixed(1)}`));
        questions.push({ question: `底面半径 ${r}，高 ${h} 的圆柱体积约为？（π≈3.14）`, options, answer, explanation: `V = πr²h = 3.14 × ${r}² × ${h} ≈ ${volume.toFixed(1)}`, grade, subject: 'math', difficulty: 3 });
      }
    }
  } else if (grade === 7) {
    for (let i = 0; i < 35; i++) {
      if (i < 12) {
        const a = rand(-8, 8); const b = rand(-8, 8);
        const correct = a + b;
        const opts = new Set([correct, correct + rand(-2, 2), correct + rand(-3, 3), rand(-10, 10)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(-10, 10));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
        const signB = b >= 0 ? `+${b}` : `${b}`;
        questions.push({ question: `${a} ${signB} = ?`, options, answer, explanation: `${a} + ${b} = ${correct}`, grade, subject: 'math', difficulty: 2 });
      } else if (i < 22) {
        const x = rand(-5, 10);
        const c1 = rand(-5, 5); const c2 = x + c1;
        const opts = new Set([x, x + rand(-2, 2), -x, rand(-5, 10)]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(-5, 10));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(x));
        questions.push({ question: `若 x ${c1 >= 0 ? '-' : '+'} ${Math.abs(c1)} = ${c2}，则 x = ?`, options, answer, explanation: `x = ${c2} ${c1 >= 0 ? '+' : '-'} ${Math.abs(c1)} = ${x}`, grade, subject: 'math', difficulty: 2 });
      } else {
        const a = rand(2, 5); const b = rand(1, 6);
        const correct = a * a + b * b;
        const opts = new Set([correct, a + b, (a + b) * (a + b), a * b]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(5, 50));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
        questions.push({ question: `若 a=${a}, b=${b}，则 a² + b² = ?`, options, answer, explanation: `a² + b² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${correct}`, grade, subject: 'math', difficulty: 3 });
      }
    }
  } else if (grade === 8) {
    for (let i = 0; i < 35; i++) {
      if (i < 12) {
        const a = rand(2, 6); const b = rand(2, 6);
        const answer_ops = [`${a + b}√${rand(1, 3)}`, `${a}√${b}`, `${a * b}`, `${a}+${b}`];
        const correct = `√${a * a * b}`;
        const opts = [correct, ...answer_ops].slice(0, 4);
        const { options, answer } = shuffleOptions(opts, 0);
        questions.push({ question: `化简 √${a * a * b} = ?`, options, answer, explanation: `√${a * a * b} = ${a}√${b}`, grade, subject: 'math', difficulty: 2 });
      } else if (i < 20) {
        const x1 = rand(-8, 3); const x2 = x1 + rand(2, 8);
        const sum = x1 + x2; const prod = x1 * x2;
        const opts = [`x²${sum >= 0 ? '+' : ''}${-sum}x${prod >= 0 ? '+' : ''}${prod}=0`, `x²${-sum >= 0 ? '+' : ''}${sum}x${-prod >= 0 ? '+' : ''}${-prod}=0`, `x²${prod >= 0 ? '+' : ''}${-prod}x${sum >= 0 ? '+' : ''}${-sum}=0`, `${rand(1, 3)}x²${sum >= 0 ? '+' : ''}${-sum}x=0`];
        const correct = `x²${sum >= 0 ? '+' : ''}${-sum}x${prod >= 0 ? '+' : ''}${prod}=0`;
        const { options, answer } = shuffleOptions(opts, opts.indexOf(correct) >= 0 ? opts.indexOf(correct) : 0);
        questions.push({ question: `根为 ${x1} 和 ${x2} 的一元二次方程是？`, options, answer, explanation: `(x${x1 >= 0 ? '+' : ''}${-x1})(x${x2 >= 0 ? '+' : ''}${-x2}) = x²${sum >= 0 ? '+' : ''}${-sum}x${prod >= 0 ? '+' : ''}${prod}=0`, grade, subject: 'math', difficulty: 3 });
      } else {
        const a = rand(1, 5); const b = rand(3, 8);
        const slope = rand(-5, 5);
        const intercept = rand(-5, 5);
        const signSlope = slope >= 0 ? '+' : ''; const signInt = intercept >= 0 ? '+' : '';
        const opts = [`y=${slope}x${signInt}${intercept}`, `y=${-slope}x${signInt}${intercept}`, `y=${slope}x${signInt}${-intercept}`, `y=${a}x${signInt}${b}`];
        const correct = `y=${slope}x${signInt}${intercept}`;
        const { options, answer } = shuffleOptions(opts, 0);
        questions.push({ question: `斜率为 ${slope}，截距为 ${intercept} 的直线方程是？`, options, answer, explanation: `y = kx + b，其中 k=${slope}, b=${intercept}`, grade, subject: 'math', difficulty: 2 });
      }
    }
  } else if (grade === 9) {
    for (let i = 0; i < 35; i++) {
      if (i < 10) {
        const a = rand(1, 5); const b = rand(1, 10); const c = rand(1, 5);
        const correct = a * a + b * c;
        const opts = new Set([correct, correct + rand(1, 10), Math.abs(correct - rand(1, 10)), a * b * c]);
        const optArr = [...opts].slice(0, 4);
        while (optArr.length < 4) optArr.push(rand(1, 50));
        const { options, answer } = shuffleOptions(optArr.map(String), optArr.indexOf(correct));
        questions.push({ question: `若 a=${a}, b=${b}, c=${c}，则 a² + bc = ?`, options, answer, explanation: `${a}² + ${b}×${c} = ${a * a} + ${b * c} = ${correct}`, grade, subject: 'math', difficulty: 2 });
      } else if (i < 18) {
        const r = rand(3, 8);
        const area = Math.round(Math.PI * r * r * 100) / 100;
        const opts = [`${area.toFixed(1)}`, `${(2 * Math.PI * r).toFixed(1)}`, `${(Math.PI * r).toFixed(1)}`, `${(area * 2).toFixed(1)}`];
        const { options, answer } = shuffleOptions(opts, opts.indexOf(`${area.toFixed(1)}`));
        questions.push({ question: `半径为 ${r} 的圆面积约为？（π≈3.14）`, options, answer, explanation: `S = πr² = 3.14 × ${r}² ≈ ${area.toFixed(1)}`, grade, subject: 'math', difficulty: 2 });
      } else if (i < 25) {
        const a = rand(3, 8); const b = rand(4, 10);
        const c = Math.round(Math.sqrt(a * a + b * b) * 100) / 100;
        const opts = [`${c.toFixed(1)}`, `${(a + b).toFixed(1)}`, `${Math.abs(a - b).toFixed(1)}`, `${(Math.sqrt(a * b)).toFixed(1)}`];
        const { options, answer } = shuffleOptions(opts, opts.indexOf(`${c.toFixed(1)}`));
        questions.push({ question: `直角边为 ${a} 和 ${b} 的直角三角形，斜边约为？`, options, answer, explanation: `c = √(${a}² + ${b}²) = √${a * a + b * b} ≈ ${c.toFixed(1)}`, grade, subject: 'math', difficulty: 3 });
      } else {
        const values = [0, 30, 45, 60, 90];
        const angle = values[rand(0, 4)];
        const trigMap: Record<number, { q: string; a: string }> = {
          0: { q: 'sin', a: '0' }, 30: { q: 'sin', a: '1/2' }, 45: { q: 'sin', a: '√2/2' }, 60: { q: 'sin', a: '√3/2' }, 90: { q: 'sin', a: '1' }
        };
        const t = trigMap[angle];
        const opts = [t.a, t.a === '0' ? '1' : '0', t.a === '1/2' ? '√3/2' : '1/2', '√2/2'];
        const unique = [...new Set(opts)].slice(0, 4);
        while (unique.length < 4) unique.push(rand(0, 1).toString());
        const { options, answer } = shuffleOptions(unique, unique.indexOf(t.a));
        questions.push({ question: `${t.q}(${angle}°) = ?`, options, answer, explanation: `${t.q}${angle}° = ${t.a}`, grade, subject: 'math', difficulty: 3 });
      }
    }
  }

  return questions;
}

function generateChineseQuestions(grade: number): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];

  const allQuestions: Record<number, { q: string; o: string[]; a: number; e: string }[]> = {
    1: [
      { q: '"床前明月光"的下一句是？', o: ['疑是地上霜', '低头思故乡', '举头望明月', '更上一层楼'], a: 0, e: '出自李白《静夜思》' },
      { q: '以下哪个字是动物？', o: ['花', '猫', '草', '天'], a: 1, e: '猫是动物，其他不是' },
      { q: '"春眠不觉晓"的下一句是？', o: ['处处闻啼鸟', '夜来风雨声', '花落知多少', '春风吹又生'], a: 0, e: '出自孟浩然《春晓》' },
      { q: '"一"的笔画数是？', o: ['1画', '2画', '3画', '4画'], a: 0, e: '一就是1画' },
      { q: '"小"的反义词是？', o: ['大', '多', '高', '长'], a: 0, e: '小对大，高对低' },
      { q: '下面哪个是水果？', o: ['桌子', '苹果', '椅子', '书本'], a: 1, e: '苹果是水果' },
      { q: '"白日依山尽"的下一句是？', o: ['黄河入海流', '更上一层楼', '欲穷千里目', '春风不度玉门关'], a: 0, e: '出自王之涣《登鹳雀楼》' },
      { q: '拼音"mā ma"对应什么？', o: ['爸爸', '爷爷', '妈妈', '奶奶'], a: 2, e: 'mā ma 是妈妈' },
      { q: '"火"字有几画？', o: ['3画', '4画', '5画', '2画'], a: 1, e: '火字共4画' },
      { q: '以下哪个是颜色？', o: ['跑', '跳', '红', '吃'], a: 2, e: '红是颜色' },
    ],
    2: [
      { q: '"锄禾日当午"的下一句是？', o: ['汗滴禾下土', '粒粒皆辛苦', '春种一粒粟', '秋收万颗子'], a: 0, e: '出自李绅《悯农》' },
      { q: '下面哪个成语是形容高兴的？', o: ['愁眉苦脸', '眉开眼笑', '泪流满面', '怒气冲冲'], a: 1, e: '眉开眼笑表示开心' },
      { q: '下列哪个词是形容词？', o: ['跑', '美丽', '吃', '看'], a: 1, e: '美丽是形容词' },
      { q: '"千里之行"的下一句是？', o: ['始于足下', '行万里路', '海纳百川', '天下为公'], a: 0, e: '千里之行，始于足下' },
      { q: '"山"字的偏旁部首是？', o: ['山字旁', '石字旁', '土字旁', '水字旁'], a: 0, e: '山本身就是山字旁' },
      { q: '下列哪个字表示数量多？', o: ['少', '众', '单', '独'], a: 1, e: '众人表示很多人' },
      { q: '"远看山有色"的下一句是？', o: ['近听水无声', '春去花还在', '人来鸟不惊', '山水有清音'], a: 0, e: '出自王维《画》' },
      { q: '比喻"做事不专心"的成语是？', o: ['一心一意', '三心二意', '专心致志', '全神贯注'], a: 1, e: '三心二意表示不专心' },
      { q: '下列哪个是名词？', o: ['跑', '跳', '花朵', '唱'], a: 2, e: '花朵是名词' },
      { q: '"独在异乡为异客"的下一句是？', o: ['每逢佳节倍思亲', '遥知兄弟登高处', '遍插茱萸少一人', '月是故乡明'], a: 0, e: '出自王维《九月九日忆山东兄弟》' },
    ],
    3: [
      { q: '下列哪个是寓言故事？', o: ['掩耳盗铃', '三国演义', '水浒传', '西游记'], a: 0, e: '掩耳盗铃是中国古代寓言故事' },
      { q: '"飞流直下三千尺"的下一句是？', o: ['疑是银河落九天', '疑似银河落九天', '遥看瀑布挂前川', '日照香炉生紫烟'], a: 0, e: '出自李白《望庐山瀑布》' },
      { q: '"守株待兔"的主人公是？', o: ['农夫', '渔夫', '猎人', '商人'], a: 0, e: '守株待兔讲的是农夫的故事' },
      { q: '"画蛇添足"的意思是什么？', o: ['多此一举', '画得很好', '增加了美感', '创新之举'], a: 0, e: '画蛇添足比喻做了多余的事' },
      { q: '表示"时间很快"的成语是？', o: ['度日如年', '光阴似箭', '一日三秋', '天长地久'], a: 1, e: '光阴似箭形容时间过得飞快' },
      { q: '"两个黄鹂鸣翠柳"的下一句是？', o: ['一行白鹭上青天', '窗含西岭千秋雪', '门泊东吴万里船', '一行白鹭向西天'], a: 0, e: '出自杜甫《绝句》' },
      { q: '下面哪个是"ABB"式词语？', o: ['绿油油', '绿油', '油绿绿', '绿绿油'], a: 0, e: '绿油油是ABB式词语' },
      { q: '"对牛弹琴"比喻什么？', o: ['对不懂道理的人讲道理', '给牛听音乐', '弹琴很动听', '牛喜欢听琴'], a: 0, e: '对牛弹琴比喻对不懂的人讲道理' },
      { q: '下面哪个词表示"看"？', o: ['听', '闻', '观', '说'], a: 2, e: '观就是看的意思' },
      { q: '下面句子中标点符号使用正确的是？', o: ['今天天气真好！', '今天天气真好。', '今天天气真好！和', '今天天气真好，'], a: 0, e: '感叹句用感叹号' },
    ],
    4: [
      { q: '下列哪个成语跟学习有关？', o: ['闻鸡起舞', '对牛弹琴', '画蛇添足', '杯弓蛇影'], a: 0, e: '闻鸡起舞指早起学习练武' },
      { q: '"洛阳亲友如相问"的下一句是？', o: ['一片冰心在玉壶', '不教胡马度阴山', '春风不度玉门关', '千里江陵一日还'], a: 0, e: '出自王昌龄《芙蓉楼送辛渐》' },
      { q: '"纸"字的结构是什么？', o: ['左右结构', '上下结构', '左中右结构', '半包围结构'], a: 2, e: '纸是绞丝旁+氏，左中右结构' },
      { q: '以下哪句出自《论语》？', o: ['学而时习之', '人之初，性本善', '天地玄黄', '赵钱孙李'], a: 0, e: '"学而时习之"出自《论语》' },
      { q: '比喻"侥幸心理"的成语是？', o: ['掩耳盗铃', '守株待兔', '刻舟求剑', '亡羊补牢'], a: 1, e: '守株待兔比喻妄想不劳而获' },
      { q: '"不识庐山真面目"的原因是？', o: ['只缘身在此山中', '远近高低各不同', '横看成岭侧成峰', '只缘云雾缭绕'], a: 0, e: '出自苏轼《题西林壁》' },
      { q: '下列哪个不是四大名著？', o: ['红楼梦', '聊斋志异', '西游记', '三国演义'], a: 1, e: '聊斋志异是蒲松龄的作品，不属于四大名著' },
      { q: '"春节"通常吃什么？', o: ['月饼', '粽子', '饺子', '元宵'], a: 2, e: '春节传统吃饺子' },
      { q: '"风声雨声读书声"的下一句是？', o: ['声声入耳', '家事国事天下事', '事事关心', '国事家事天下事'], a: 0, e: '风声雨声读书声，声声入耳' },
      { q: '"桃"字查字典应查哪个部首？', o: ['木', '兆', '木字旁', '兆字旁'], a: 0, e: '桃的部首是木' },
    ],
    5: [
      { q: '"温故而知新"的下一句是？', o: ['可以为师矣', '不亦乐乎', '可以为师', '可以为师焉'], a: 0, e: '出自《论语》' },
      { q: '"破釜沉舟"的主人公是谁？', o: ['项羽', '刘邦', '韩信', '曹操'], a: 0, e: '项羽破釜沉舟，大破秦军' },
      { q: '"但愿人长久"的下一句是？', o: ['千里共婵娟', '月是故乡明', '天涯共此时', '把酒问青天'], a: 0, e: '出自苏轼《水调歌头》' },
      { q: '"一览众山小"出自哪首诗？', o: ['《望岳》', '《登高》', '《静夜思》', '《登鹳雀楼》'], a: 0, e: '出自杜甫《望岳》' },
      { q: '下列哪个词语搭配最恰当？', o: ['克服困难', '克服快乐', '制造困难', '消灭快乐'], a: 0, e: '克服困难是正确搭配' },
      { q: '下面哪个字是形声字？', o: ['湖', '日', '月', '人'], a: 0, e: '湖是形声字，氵表意，胡表音' },
      { q: '"大漠孤烟直"的下一句是？', o: ['长河落日圆', '一片孤城万仞山', '黄河入海流', '春风不度玉门关'], a: 0, e: '出自王维《使至塞上》' },
      { q: '下面哪个是对偶句？', o: ['天对地，雨对风', '天和地', '天很高', '地很厚'], a: 0, e: '天对地，雨对风使用了对偶' },
      { q: '"纸上谈兵"讽刺了什么？', o: ['空谈理论', '努力学习', '勤奋练兵', '爱好书法'], a: 0, e: '纸上谈兵讽刺脱离实际、空谈理论' },
      { q: '以下哪个不是修辞手法？', o: ['比喻', '拟人', '夸张', '朗读'], a: 3, e: '朗读不是修辞手法' },
    ],
    6: [
      { q: '"落霞与孤鹜齐飞"出自哪篇文章？', o: ['《滕王阁序》', '《岳阳楼记》', '《醉翁亭记》', '《桃花源记》'], a: 0, e: '出自王勃《滕王阁序》' },
      { q: '下列哪个标点符号使用正确？', o: ['今天天气真好！', '你好吗。', '这是什么；', '他说的话"很有意思"。'], a: 0, e: '感叹句用感叹号' },
      { q: '"先天下之忧而忧"的下一句是？', o: ['后天下之乐而乐', '先天下之忧', '不以物喜', '不以己悲'], a: 0, e: '出自范仲淹《岳阳楼记》' },
      { q: '下列哪个成语与"坚持不懈"意思相近？', o: ['锲而不舍', '半途而废', '浅尝辄止', '功亏一篑'], a: 0, e: '锲而不舍表示坚持到底' },
      { q: '下列作品属于鲁迅的是？', o: ['《呐喊》', '《家》', '《春》', '《秋》'], a: 0, e: '《呐喊》是鲁迅的作品' },
      { q: '"出淤泥而不染"描写的植物是？', o: ['荷花', '梅花', '菊花', '兰花'], a: 0, e: '出自周敦颐《爱莲说》，描写莲花' },
      { q: '"桂林山水甲天下"中的"甲"意思是？', o: ['第一', '壳', '盔甲', '指甲'], a: 0, e: '甲天下即天下第一' },
      { q: '下列哪个是反问句？', o: ['难道不是吗？', '你好吗？', '这是什么？', '你去吗？'], a: 0, e: '"难道不是吗"是反问句' },
      { q: '"醉翁之意不在酒"的后半句是？', o: ['在乎山水之间也', '在乎山水之间', '在乎山水也', '在乎天地之间'], a: 0, e: '出自欧阳修《醉翁亭记》' },
      { q: '下列哪个词是褒义词？', o: ['英勇', '狡猾', '丑陋', '肮脏'], a: 0, e: '英勇是褒义词' },
    ],
    7: [
      { q: '"学而不思则罔"的下一句是？', o: ['思而不学则殆', '思而不学则毁', '学而时习之', '温故而知新'], a: 0, e: '出自《论语》' },
      { q: '下列哪部作品是小说？', o: ['《骆驼祥子》', '《诗经》', '《论语》', '《史记》'], a: 0, e: '《骆驼祥子》是老舍的小说' },
      { q: '下列哪个不属于唐宋八大家？', o: ['李白', '韩愈', '柳宗元', '苏轼'], a: 0, e: '李白是大诗人，不属于唐宋八大家' },
      { q: '"会当凌绝顶"表达什么情感？', o: ['雄心壮志', '悲伤失意', '思念家乡', '离别之情'], a: 0, e: '表达诗人登顶泰山的雄心壮志' },
      { q: '下列句子中"之"的用法与其他不同的是？', o: ['吾欲之南海', '送孟浩然之广陵', '学而时习之', '之乎者也'], a: 2, e: '"学而时习之"中"之"是代词，其余是动词' },
      { q: '"少壮不努力"的下一句是？', o: ['老大徒伤悲', '青春不复返', '努力在当下', '光阴不可追'], a: 0, e: '出自《长歌行》' },
      { q: '下列哪个是主谓短语？', o: ['太阳升起', '美丽的花', '在桌上', '跑得快'], a: 0, e: '太阳升起是主谓结构' },
      { q: '下列作品中作者属于"初唐四杰"的是？', o: ['王勃', '李白', '杜甫', '白居易'], a: 0, e: '王勃是初唐四杰之一' },
      { q: '"知之者不如好之者"的下一句是？', o: ['好之者不如乐之者', '乐之者不如好之者', '好之者不如知之者', '好知者不如乐知者'], a: 0, e: '出自《论语》' },
      { q: '下面哪个不是中国四大发明？', o: ['造纸术', '印刷术', '火药', '青铜器'], a: 3, e: '青铜器不属于四大发明' },
    ],
    8: [
      { q: '下列古代文学家与其作品对应正确的是？', o: ['司马迁—《史记》', '李白—《论语》', '杜甫—《三国演义》', '苏轼—《水浒传》'], a: 0, e: '司马迁著《史记》' },
      { q: '"天将降大任于是人也"出自哪部经典？', o: ['《孟子》', '《论语》', '《大学》', '《中庸》'], a: 0, e: '出自《孟子·告子下》' },
      { q: '"忽如一夜春风来"使用的修辞手法是？', o: ['比喻', '拟人', '夸张', '对偶'], a: 0, e: '将雪比作春风中盛开的花朵' },
      { q: '下列哪个句子使用了通感修辞？', o: ['远处传来悠扬的琴声，像流水一样', '月亮像玉盘一样', '他跑得像风一样快', '花儿红得像火'], a: 0, e: '将听觉(琴声)比作视觉/触觉(流水)' },
      { q: '以下哪个是《诗经》的篇目？', o: ['《关雎》', '《离骚》', '《九歌》', '《天问》'], a: 0, e: '《关雎》是《诗经》国风的第一篇' },
      { q: '"长风破浪会有时"的下一句是？', o: ['直挂云帆济沧海', '乘风破浪会有时', '直挂云帆济沧海间', '风吹浪打也向前'], a: 0, e: '出自李白《行路难》' },
      { q: '下列哪个文学常识是正确的？', o: ['《红楼梦》共120回', '《西游记》共100回', '《水浒传》共108回', '《三国演义》共80回'], a: 0, e: '《红楼梦》共120回（前80回曹雪芹，后40回高鹗续写）' },
      { q: '下列哪项是状语后置？', o: ['吾谁与归', '何陋之有', '唯利是图', '生于忧患'], a: 2, e: '唯利是图是宾语前置（唯…是…）' },
      { q: '"不以物喜，不以己悲"体现了什么？', o: ['豁达胸怀', '悲伤情绪', '愤怒之情', '羡慕之心'], a: 0, e: '表现了达观的人生态度' },
      { q: '下列作品中不属于文言小说的是？', o: ['《聊斋志异》', '《红楼梦》', '《儒林外史》', '《平凡的世界》'], a: 3, e: '《平凡的世界》是当代白话小说' },
    ],
    9: [
      { q: '下列不属于"春秋三传"的是？', o: ['《左传》', '《公羊传》', '《穀梁传》', '《史记》'], a: 3, e: '春秋三传是《左传》《公羊传》《穀梁传》' },
      { q: '"路漫漫其修远兮"的作者是？', o: ['屈原', '李白', '杜甫', '苏轼'], a: 0, e: '出自屈原《离骚》' },
      { q: '"朱门酒肉臭"的下一句是？', o: ['路有冻死骨', '贫富两重天', '富人不知贫', '寒门无饱暖'], a: 0, e: '出自杜甫"朱门酒肉臭，路有冻死骨"' },
      { q: '李清照属于哪个词派？', o: ['婉约派', '豪放派', '田园派', '边塞派'], a: 0, e: '李清照是婉约派代表词人' },
      { q: '下列哪个是倒装句？', o: ['甚矣，汝之不惠', '学而时习之', '有朋自远方来', '温故而知新'], a: 0, e: '甚矣汝之不惠，正常语序：汝之不惠甚矣' },
      { q: '"沉舟侧畔千帆过"的下一句是？', o: ['病树前头万木春', '轻舟已过万重山', '千树万树梨花开', '万紫千红总是春'], a: 0, e: '出自刘禹锡《酬乐天扬州初逢席上见赠》' },
      { q: '下列哪个是《史记》的体例？', o: ['纪传体', '编年体', '国别体', '断代体'], a: 0, e: '《史记》是纪传体通史' },
      { q: '下列诗句中描写边塞的是？', o: ['大漠孤烟直', '桃花潭水深千尺', '小荷才露尖尖角', '霜叶红于二月花'], a: 0, e: '大漠孤烟直描写边塞风光' },
      { q: '下列哪个文学现象出现在唐代？', o: ['诗歌鼎盛', '词的兴起', '曲的兴盛', '小说的繁荣'], a: 0, e: '唐代是诗歌最繁荣的时期' },
      { q: '"塞翁失马"出自哪部典籍？', o: ['《淮南子》', '《论语》', '《孟子》', '《庄子》'], a: 0, e: '塞翁失马出自《淮南子·人间训》' },
    ],
  };

  const gradeQuestions = allQuestions[grade] || allQuestions[1];
  for (const q of gradeQuestions) {
    questions.push({ question: q.q, options: q.o, answer: q.a, explanation: q.e, grade, subject: 'chinese' as const, difficulty: grade <= 3 ? 1 : grade <= 6 ? 2 : 3 });
  }
  return questions;
}

function generateScienceQuestions(grade: number): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];

  const allQuestions: Record<number, { q: string; o: string[]; a: number; e: string }[]> = {
    1: [
      { q: '太阳从哪个方向升起？', o: ['东方', '西方', '南方', '北方'], a: 0, e: '太阳总是从东方升起' },
      { q: '下列哪个动物会飞？', o: ['小鸟', '小狗', '小猫', '小鱼'], a: 0, e: '小鸟有翅膀可以飞' },
      { q: '植物的生长需要什么？', o: ['阳光、水和空气', '只有水', '只有阳光', '只有空气'], a: 0, e: '植物生长需要阳光、水和空气' },
      { q: '一年有几个季节？', o: ['4个', '2个', '3个', '5个'], a: 0, e: '一年有春、夏、秋、冬四个季节' },
      { q: '下列哪种天气需要打伞？', o: ['下雨', '晴天', '多云', '刮风'], a: 0, e: '下雨天需要打伞' },
    ],
    2: [
      { q: '地球是太阳系中的什么？', o: ['行星', '恒星', '卫星', '彗星'], a: 0, e: '地球是太阳系的一颗行星' },
      { q: '下列哪种是昆虫？', o: ['蝴蝶', '蜘蛛', '蜗牛', '蚯蚓'], a: 0, e: '蝴蝶是昆虫，蜘蛛是节肢动物' },
      { q: '水的沸点是多少度？', o: ['100°C', '0°C', '50°C', '200°C'], a: 0, e: '在标准大气压下，水在100°C沸腾' },
      { q: '下列哪个不是哺乳动物？', o: ['鸡', '狗', '猫', '牛'], a: 0, e: '鸡是鸟类，不是哺乳动物' },
      { q: '请问一个星期有几天？', o: ['7天', '5天', '6天', '8天'], a: 0, e: '一个星期有7天' },
    ],
    3: [
      { q: '植物的哪个部分负责吸收水分？', o: ['根', '茎', '叶', '花'], a: 0, e: '根是植物吸收水分和养分的主要器官' },
      { q: '光的三原色是？', o: ['红、绿、蓝', '红、黄、蓝', '红、黄、绿', '黄、绿、蓝'], a: 0, e: '光的三原色是红(R)、绿(G)、蓝(B)' },
      { q: '下列哪种力让物体落向地面？', o: ['重力', '摩擦力', '弹力', '浮力'], a: 0, e: '重力使物体落向地面' },
      { q: '食物链中，植物通常扮演什么角色？', o: ['生产者', '消费者', '分解者', '捕食者'], a: 0, e: '植物通过光合作用制造有机物，是生产者' },
      { q: '请问我国国土面积约是多少？', o: ['约960万平方公里', '约800万平方公里', '约500万平方公里', '约1200万平方公里'], a: 0, e: '中国陆地面积约960万平方公里' },
    ],
    4: [
      { q: '人体最大的器官是？', o: ['皮肤', '心脏', '肝脏', '大脑'], a: 0, e: '皮肤是人体最大的器官' },
      { q: '下列哪种物质在常温下是液体？', o: ['水银', '铁', '木头', '玻璃'], a: 0, e: '水银(汞)是常温下唯一的液态金属' },
      { q: '风是怎么形成的？', o: ['空气流动', '地球自转', '太阳照射', '月亮引力'], a: 0, e: '风是由空气的流动形成的' },
      { q: '下列哪个是导体？', o: ['铜', '木头', '塑料', '玻璃'], a: 0, e: '铜是良好的电导体' },
      { q: '月亮是什么？', o: ['地球的卫星', '行星', '恒星', '彗星'], a: 0, e: '月球是地球唯一的天然卫星' },
    ],
    5: [
      { q: '声音在以下哪种介质中传播最快？', o: ['固体', '液体', '气体', '真空'], a: 0, e: '声音在固体中传播最快' },
      { q: '人体正常体温约为？', o: ['36-37°C', '38-39°C', '34-35°C', '40-41°C'], a: 0, e: '人体正常体温约为36-37°C' },
      { q: '地球的卫星是？', o: ['月球', '太阳', '火星', '金星'], a: 0, e: '月球是地球的卫星' },
      { q: '彩虹有几种颜色？', o: ['7种', '5种', '6种', '8种'], a: 0, e: '彩虹有红橙黄绿蓝靛紫七种颜色' },
      { q: '下列哪种能源是可再生能源？', o: ['太阳能', '煤炭', '石油', '天然气'], a: 0, e: '太阳能是可再生能源' },
    ],
    6: [
      { q: '细胞的基本结构不包括？', o: ['骨骼', '细胞膜', '细胞质', '细胞核'], a: 0, e: '细胞的基本结构包括细胞膜、细胞质和细胞核' },
      { q: '力的单位是什么？', o: ['牛顿', '千克', '米', '秒'], a: 0, e: '力的单位是牛顿(N)' },
      { q: '下列哪个是简单机械？', o: ['杠杆', '电动机', '发电机', '电脑'], a: 0, e: '杠杆是简单机械之一' },
      { q: '以下哪种气体在空气中含量最多？', o: ['氮气', '氧气', '二氧化碳', '氢气'], a: 0, e: '空气中氮气约占78%' },
      { q: '地球绕太阳一周需要多长时间？', o: ['一年', '一个月', '一天', '一周'], a: 0, e: '地球绕太阳公转一周约365天' },
    ],
    7: [
      { q: '化学反应前后不变的是？', o: ['原子种类', '分子种类', '物质状态', '颜色'], a: 0, e: '化学反应中原子种类和数量不变' },
      { q: '下列哪个是溶液？', o: ['盐水', '牛奶', '泥水', '油水'], a: 0, e: '盐水是均一稳定的溶液' },
      { q: '光的传播速度约为？', o: ['30万公里/秒', '340米/秒', '3万公里/秒', '300公里/秒'], a: 0, e: '光速约为30万公里/秒' },
      { q: '人体有多少对染色体？', o: ['23对', '22对', '24对', '20对'], a: 0, e: '人体有23对染色体' },
      { q: '下列哪个不是生物的特征？', o: ['会生锈', '能生长', '能繁殖', '需要营养'], a: 0, e: '会生锈不是生物特征' },
    ],
    8: [
      { q: '哪个定律描述了力和加速度的关系？', o: ['牛顿第二定律', '牛顿第一定律', '牛顿第三定律', '万有引力定律'], a: 0, e: 'F=ma，牛顿第二定律' },
      { q: '以下哪种波可以在真空中传播？', o: ['电磁波', '声波', '水波', '地震波'], a: 0, e: '电磁波不需要介质，可以在真空中传播' },
      { q: '人类血型中被称为"万能输血者"的是？', o: ['O型', 'A型', 'B型', 'AB型'], a: 0, e: 'O型血可输给任何血型' },
      { q: 'pH值大于7表示？', o: ['碱性', '酸性', '中性', '不确定'], a: 0, e: 'pH>7为碱性，pH=7为中性，pH<7为酸性' },
      { q: '地球上最大的生态系统是？', o: ['生物圈', '海洋', '森林', '草原'], a: 0, e: '生物圈是地球上最大的生态系统' },
    ],
    9: [
      { q: 'DNA的全称是什么？', o: ['脱氧核糖核酸', '核糖核酸', '氨基酸', '蛋白质'], a: 0, e: 'DNA为脱氧核糖核酸' },
      { q: '相对论是谁提出的？', o: ['爱因斯坦', '牛顿', '伽利略', '霍金'], a: 0, e: '爱因斯坦提出相对论' },
      { q: '下列哪个是元素周期表中的元素？', o: ['铁', '水', '空气', '泥土'], a: 0, e: '铁(Fe)是化学元素' },
      { q: '一个标准大气压等于？', o: ['101.3kPa', '100kPa', '50kPa', '200kPa'], a: 0, e: '标准大气压为101.3kPa' },
      { q: '量子力学主要研究什么？', o: ['微观粒子', '宏观天体', '生物进化', '地质变化'], a: 0, e: '量子力学研究微观粒子运动规律' },
    ],
  };

  const gradeQuestions = allQuestions[grade] || allQuestions[5];
  for (const q of gradeQuestions) {
    questions.push({ question: q.q, options: q.o, answer: q.a, explanation: q.e, grade, subject: 'science' as const, difficulty: grade <= 3 ? 1 : grade <= 6 ? 2 : 3 });
  }
  return questions;
}

function generateFunQuestions(grade: number): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];

  const allQuestions: Record<number, { q: string; o: string[]; a: number; e: string }[]> = {
    1: [
      { q: '什么动物最喜欢吃竹子？', o: ['大熊猫', '小狗', '小猫', '小鸟'], a: 0, e: '大熊猫最喜欢吃竹子' },
      { q: '什么东西越洗越脏？', o: ['水', '衣服', '手', '毛巾'], a: 0, e: '水越洗东西越脏' },
      { q: '下面哪个颜色最像天空？', o: ['蓝色', '红色', '绿色', '黑色'], a: 0, e: '天空是蓝色的' },
      { q: '1+1在什么情况下等于3？', o: ['算错时', '永远不', '任何时候', '在梦里'], a: 0, e: '算错的时候1+1才等于3' },
      { q: '你能用一根筷子吃饭吗？', o: ['不能用', '可以用', '当然能', '看情况'], a: 0, e: '一根筷子很难夹起食物' },
    ],
    2: [
      { q: '世界上什么海最大？', o: ['太平洋', '大西洋', '印度洋', '北冰洋'], a: 0, e: '太平洋是世界上最大的洋' },
      { q: '什么人最喜欢下雨？', o: ['卖伞的人', '农民', '学生', '老师'], a: 0, e: '卖伞的人喜欢下雨天，生意好' },
      { q: '什么布剪不断？', o: ['瀑布', '棉布', '麻布', '丝绸'], a: 0, e: '瀑布是水流，剪不断' },
      { q: '鸡蛋最怕什么？', o: ['掉地上', '被吃掉', '被煮', '被炒'], a: 0, e: '鸡蛋掉地上会碎' },
      { q: '什么车最长？', o: ['堵车', '火车', '汽车', '自行车'], a: 0, e: '堵车的时候车排成队很长' },
    ],
    3: [
      { q: '为什么鸟不会触电站在电线上？', o: ['因为两只脚在同一根线上', '鸟的身体不导电', '鸟有绝缘羽毛', '电线没有电'], a: 0, e: '鸟的两只脚在同一根线上，没有电压差' },
      { q: '什么书最香？', o: ['菜谱', '小说', '课本', '字典'], a: 0, e: '菜谱里都是美食' },
      { q: '小明从10楼跳下来为什么没事？', o: ['他从一楼楼梯往下跳', '他会飞', '有降落伞', '下面是水池'], a: 0, e: '是"从10楼"这个地址的一楼跳' },
      { q: '为什么暑假比寒假长？', o: ['热胀冷缩', '因为夏天热', '学校规定', '暑假有两个月'], a: 0, e: '这是一个经典冷笑话——热胀冷缩' },
      { q: '什么帽子不能戴？', o: ['螺丝帽', '草帽', '礼帽', '太阳帽'], a: 0, e: '螺丝帽是用来拧的不是戴的' },
    ],
    4: [
      { q: '什么人没有午饭吃？', o: ['免费的午餐不存在', '穷人', '忙人', '不吃午饭的人'], a: 0, e: '天下没有免费的午餐' },
      { q: '为什么有人的牙是假的？', o: ['因为真牙掉了', '天生的', '为了好看', '不知道'], a: 0, e: '真牙脱落或损坏后装的假牙' },
      { q: '时钟什么时候不会走？', o: ['时钟本来就不会"走"', '坏了的时候', '没电的时候', '晚上'], a: 0, e: '时钟没有腿，本来就不会走，只会转' },
      { q: '为什么企鹅住在南极？', o: ['因为那里冷', '因为北极太热', '因为食物多', '因为喜欢冰'], a: 0, e: '企鹅是适应寒冷环境的动物' },
      { q: '什么鱼不能吃？', o: ['木鱼', '草鱼', '鲫鱼', '鲤鱼'], a: 0, e: '木鱼是乐器，不能吃' },
    ],
    5: [
      { q: '什么门不能关？', o: ['球门', '房门', '车门', '校门'], a: 0, e: '球门进球的"门"不能关' },
      { q: '比细菌还小的是什么？', o: ['细菌的影子', '病毒', '原子', '更小的细菌'], a: 0, e: '细菌没有影子！' },
      { q: '为什么诸葛亮能借东风？', o: ['靠气象知识预测', '他有法术', '是虚构的', '运气好'], a: 0, e: '诸葛亮精通天文气象，预测到了东风' },
      { q: '什么路最窄？', o: ['冤家路窄', '小路', '山路', '巷子'], a: 0, e: '冤家路窄，是成语也是脑筋急转弯' },
      { q: '一只蚂蚁居然从北京爬到了广州，可能吗？', o: ['可能，在地图上爬', '不可能', '在动画片里', '蚂蚁坐车'], a: 0, e: '蚂蚁在地图上爬，只需要几厘米' },
    ],
    6: [
      { q: '进动物园看到的第一个动物是什么？', o: ['人', '猴子', '大象', '长颈鹿'], a: 0, e: '你看到的是动物园里的人' },
      { q: '为什么自由女神像站在纽约港口？', o: ['因为她坐不下来', '因为那里风景好', '为了迎接移民', '因为法国人放在那里'], a: 0, e: '雕像不能坐，所以只能站' },
      { q: '电影院里正在放电影，为什么没人看？', o: ['放的是恐怖片，没人敢看', '都闭眼了', '没人买票', '电影还没开始'], a: 0, e: '放的是恐怖片，大家都闭眼不敢看' },
      { q: '什么花一年四季都开？', o: ['塑料花', '梅花', '菊花', '荷花'], a: 0, e: '塑料花不是真花，但一年四季都"开"' },
      { q: '桌子上有12支蜡烛，风吹灭了3支，还剩几支？', o: ['12支', '9支', '3支', '0支'], a: 0, e: '吹灭的蜡烛还在桌上，所以还是12支' },
    ],
    7: [
      { q: '什么情况下2+2=5？', o: ['计算错误时', '在梦中', '永远不可能', '在数学悖论中'], a: 0, e: '只有算错的时候2+2才等于5' },
      { q: '什么山不能爬？', o: ['人山人海', '泰山', '华山', '黄山'], a: 0, e: '人山人海形容人多，不是真的山' },
      { q: '为什么有的人喜欢熬夜？', o: ['因为安静效率高', '大家都喜欢', '白天太短', '不喜欢睡觉'], a: 0, e: '晚上安静，适合专注工作或学习' },
      { q: '什么键可以打开知识的大门？', o: ['关键', '键盘', '门键', '钥匙'], a: 0, e: '关键比喻最重要的事物' },
      { q: '为什么足球是圆的？', o: ['因为圆的滚得顺', '因为规则规定', '其他形状不好踢', '传统'], a: 0, e: '圆形的球滚动轨迹最规则可控' },
    ],
    8: [
      { q: '火车由北京到上海需要6小时，行驶3小时后在哪？', o: ['在铁轨上', '在济南', '在南京', '在路上'], a: 0, e: '火车永远在铁轨上行驶' },
      { q: '什么是最快的书？', o: ['说明书', '小说', '字典', '漫画'], a: 0, e: '说明书(说"明"书)"说"得快' },
      { q: '为什么程序员总是穿两只不同的袜子？', o: ['这是个笑话，他们可能没注意', '为了好运', '时尚', '公司规定'], a: 0, e: '程序员专注代码，不太在意外表细节' },
      { q: '用什么可以解开所有谜题？', o: ['答案', '钥匙', '密码', '线索'], a: 0, e: '答案可以解开所有谜题' },
      { q: '把8分成两半是多少？', o: ['0和0', '4和4', '3和5', '2和6'], a: 0, e: '如果把8上下切开，两个半边都像0' },
    ],
    9: [
      { q: '什么比光速还快？', o: ['思想', '声音', '电流', '火箭'], a: 0, e: '思想可以瞬间"飞"到任何地方' },
      { q: '为什么有人的成绩单像可乐？', o: ['因为全是C(cola)', '因为很好喝', '因为有气泡', '因为是黑色的'], a: 0, e: '英文中C等级=C，可乐=cola，谐音梗' },
      { q: '什么东西不论你跑得多快，永远追不上？', o: ['昨天', '明天', '影子', '别人'], a: 0, e: '昨天已经过去，永远追不回来' },
      { q: '数学考100分的秘诀是什么？', o: ['认真学', '作弊', '运气', '不考'], a: 0, e: '认真学才是考满分的真正秘诀' },
      { q: '世界上最长的单词是什么？', o: ['smiles（笑容）', 'pneumonoultramicroscopicsilicovolcanoconiosis', 'honorificabilitudinitatibus', 'antidisestablishmentarianism'], a: 0, e: '因为两个s之间有一"mile"(英里)' },
    ],
  };

  const gradeQuestions = allQuestions[grade] || allQuestions[5];
  for (const q of gradeQuestions) {
    questions.push({ question: q.q, options: q.o, answer: q.a, explanation: q.e, grade, subject: 'fun' as const, difficulty: 1 });
  }
  return questions;
}

function generateRiddleQuestions(grade: number): QuizQuestionInput[] {
  const questions: QuizQuestionInput[] = [];

  const allQuestions: Record<number, { q: string; o: string[]; a: number; e: string }[]> = {
    1: [
      { q: '上边毛，下边毛，中间一颗黑葡萄（猜一器官）', o: ['眼睛', '鼻子', '嘴巴', '耳朵'], a: 0, e: '睫毛是毛，眼球像黑葡萄' },
      { q: '五个兄弟，住在一起，名字不同，高矮不齐（猜身体部位）', o: ['手指', '脚趾', '牙齿', '头发'], a: 0, e: '五根手指长短不一' },
      { q: '有头没有颈，身上冷冰冰（猜一动物）', o: ['鱼', '蛇', '鸟', '狗'], a: 0, e: '鱼有头但没有明显的脖子，是冷血动物' },
      { q: '一个小姑娘，生在水中央，身穿粉红衫，坐在绿船上（猜一植物）', o: ['荷花', '菊花', '梅花', '桃花'], a: 0, e: '荷花长在水中，粉色花瓣，绿色荷叶' },
      { q: '像糖不是糖，有圆也有方，帮你改错字，自己不怕脏（猜一文具）', o: ['橡皮', '铅笔', '尺子', '文具盒'], a: 0, e: '橡皮擦可以擦掉错字' },
    ],
    2: [
      { q: '一座七彩桥，雨后天上挂（猜自然现象）', o: ['彩虹', '晚霞', '闪电', '白云'], a: 0, e: '雨后出现的彩虹有七种颜色' },
      { q: '千条线，万条线，落在水里看不见（猜自然现象）', o: ['雨', '雪', '冰雹', '雾'], a: 0, e: '雨丝像线条，落入水中看不见' },
      { q: '身穿绿衣裳，肚里水汪汪，生的子儿多，个个黑脸膛（猜一水果）', o: ['西瓜', '苹果', '葡萄', '桃子'], a: 0, e: '西瓜绿皮、多水、黑籽' },
      { q: '有个好朋友，天天跟我走，有时走在前，有时走在后，我和他说话，就是不开口（猜一现象）', o: ['影子', '书包', '同学', '宠物'], a: 0, e: '影子一直跟着人，不会说话' },
      { q: '白嫩小宝宝，洗澡吹泡泡，洗洗身体小，再洗不见了（猜一日常用品）', o: ['肥皂', '毛巾', '牙刷', '梳子'], a: 0, e: '肥皂越用越小，最后消失' },
    ],
    3: [
      { q: '屋子方方，有门没窗，屋外热烘烘，屋里结冰霜（猜一家电）', o: ['冰箱', '空调', '微波炉', '洗衣机'], a: 0, e: '冰箱外形方正，里面制冷' },
      { q: '独木造高楼，没瓦没砖头，人在水下走，水在人上流（猜一日常用品）', o: ['雨伞', '帽子', '雨衣', '鞋子'], a: 0, e: '雨伞像独木高楼，撑伞时人在伞下' },
      { q: '有面没有口，有脚没有手，虽有四只脚，自己不会走（猜一家具）', o: ['桌子', '椅子', '床', '柜子'], a: 0, e: '桌子有桌面没有口，四条腿不会走' },
      { q: '身穿大皮袄，野草吃个饱，过了严冬天，献出一身毛（猜一动物）', o: ['绵羊', '牛', '马', '兔子'], a: 0, e: '绵羊吃草，产羊毛' },
      { q: '小货郎，不挑担，背着针，满处窜（猜一动物）', o: ['刺猬', '蜜蜂', '蚂蚁', '蜘蛛'], a: 0, e: '刺猬浑身是刺像背着针' },
    ],
    4: [
      { q: '远看山有色，近听水无声，春去花还在，人来鸟不惊（猜一物）', o: ['画', '电视', '照片', '镜子'], a: 0, e: '画中的山、水、花、鸟都是静止的' },
      { q: '有风不动无风动，不动无风动有风（猜一日常用品）', o: ['扇子', '风扇', '旗子', '窗帘'], a: 0, e: '扇子扇动产生风，不动时没有风' },
      { q: '生在水中，却怕水冲，放到水里，无影无踪（猜一调味品）', o: ['盐', '糖', '油', '醋'], a: 0, e: '盐溶于水后看不见' },
      { q: '长长一条龙，走路轰隆隆，跨河又穿山，呜的一声向前冲（猜一交通工具）', o: ['火车', '汽车', '飞机', '轮船'], a: 0, e: '火车像长龙，轰隆声，穿山越岭' },
      { q: '一个黑孩，从不开口，要是开口，掉出舌头（猜一食品）', o: ['瓜子', '花生', '核桃', '糖果'], a: 0, e: '瓜子壳是黑的，嗑开露出白色瓜子仁' },
    ],
    5: [
      { q: '一物生得巧，地位比人高，戴上御风寒，脱下有礼貌（猜一服饰）', o: ['帽子', '围巾', '手套', '袜子'], a: 0, e: '帽子戴在头上，地位比人高，摘下时行脱帽礼' },
      { q: '弟兄七八个，围着柱子坐，只要一分开，衣服就扯破（猜一蔬菜）', o: ['大蒜', '洋葱', '白菜', '萝卜'], a: 0, e: '蒜瓣围着蒜柱，分开时剥掉蒜皮' },
      { q: '嘴像小铲子，脚像小扇子，走路左右摆，不是摆架子（猜一动物）', o: ['鸭子', '鹅', '鸡', '鸽子'], a: 0, e: '鸭子嘴扁像铲，脚有蹼像扇，走路摇摆' },
      { q: '池中有个小姑娘，从小生在水中央，粉红笑脸迎风摆，只只绿船水上划（猜一植物）', o: ['荷花', '水仙', '浮萍', '莲花'], a: 0, e: '荷花粉色花瓣浮在水面，绿叶如船' },
      { q: '一根小棍儿，顶个圆粒儿，小孩们玩它，容易出事儿（猜一玩具/危险品）', o: ['火柴', '弹珠', '积木', '风筝'], a: 0, e: '火柴危险，小孩不能玩火' },
    ],
    6: [
      { q: '一物三口，有腿无手，谁要没它，难见亲友（猜一日常用品）', o: ['裤子', '衣服', '鞋子', '帽子'], a: 0, e: '裤子有三口（两裤腿+腰部），不穿裤子难见人' },
      { q: '生在鸡家湾，嫁到竹家滩，向来爱干净，常逛灰家山（猜一日常用品）', o: ['鸡毛掸子', '扫帚', '抹布', '拖把'], a: 0, e: '鸡毛来自鸡，绑在竹竿上，用来掸灰尘' },
      { q: '一盏灯，亮晶晶，不怕暴雨和狂风，夜夜眨眼到天明，专给飞机指航程（猜一建筑）', o: ['灯塔', '路灯', '红绿灯', '探照灯'], a: 0, e: '灯塔为飞机和船导航' },
      { q: '千锤万凿出深山，烈火焚烧若等闲，粉身碎骨浑不怕，要留清白在人间（猜一物）', o: ['石灰', '煤炭', '石头', '水泥'], a: 0, e: '出自于谦《石灰吟》，描写石灰的制作过程' },
      { q: '小小诸葛亮，独坐中军帐，摆下八卦阵，专捉飞来将（猜一动物）', o: ['蜘蛛', '青蛙', '壁虎', '蜻蜓'], a: 0, e: '蜘蛛织网像八卦阵，专门捕捉飞虫' },
    ],
    7: [
      { q: '有眼无珠一身光，穿红穿绿又穿黄，跟着懒人它就睡，跟着勤人它就忙（猜一日常用品）', o: ['针', '剪刀', '尺子', '顶针'], a: 0, e: '针有"眼"（针孔），常穿彩线，勤快人才用' },
      { q: '兄弟两个一样长，进进出出总成双，千般苦辣酸甜味，它们都要先来尝（猜一餐具）', o: ['筷子', '勺子', '叉子', '吸管'], a: 0, e: '筷子成双使用，吃饭时先接触食物' },
      { q: '黑黑一间房，平时不开窗，窗子一打开，把你拉进房（猜一家电）', o: ['电视机', '电脑', '冰箱', '洗衣机'], a: 0, e: '电视屏幕像黑房间，打开后吸引人观看' },
      { q: '什么动物，你打死了它，却流了你的血？', o: ['蚊子', '苍蝇', '蜜蜂', '蛇'], a: 0, e: '打死吸了血的蚊子，流出的血是自己的' },
      { q: '一物来看，有两人，两马各一边，一个大一个小，一个在前的却在后，一在后的却在前（猜一字）', o: ['驾', '骑', '驶', '驱'], a: 0, e: '驾字的拆解：加+马=驾' },
    ],
    8: [
      { q: '有嘴不能说，有肚不吃馍，虽说无胃病，黄水吐得多（猜一文具）', o: ['钢笔', '铅笔', '毛笔', '圆珠笔'], a: 0, e: '钢笔有笔嘴和墨囊（肚），吐墨水（黄水）' },
      { q: '一字生得巧，四面都是山，若要看清楚，必须翻一翻（猜一字）', o: ['田', '山', '回', '十'], a: 0, e: '田字四面看去都是"山"字的变体' },
      { q: '什么书中毛病最多？', o: ['医书', '教科书', '小说', '漫画'], a: 0, e: '医书里记载的都是各种疾病（毛病）' },
      { q: '两只小船各东西，十个客人坐当中，白天里来往往，夜晚客去船空（猜一日常用品）', o: ['鞋子', '袜子', '手套', '衣服'], a: 0, e: '鞋子像两只小船，十个脚趾像客人，白天穿鞋走路，晚上脱鞋' },
      { q: '一字四十八个头，当中有水不外流（猜一字）', o: ['井', '田', '回', '中'], a: 0, e: '井字拆开看四个"十"和八个"头"（点），中间有水' },
    ],
    9: [
      { q: '半天不动，忽然一动，上面欢喜，下面好痛（猜一活动）', o: ['钓鱼', '划船', '攀岩', '跳水'], a: 0, e: '钓鱼时长时间不动，突然鱼上钩，人高兴，鱼痛苦' },
      { q: '什么东西天气越热，它爬得越高？', o: ['温度计', '太阳', '气球', '云'], a: 0, e: '温度计里的水银/酒精受热上升' },
      { q: '一家有七口，只种田不种地，遮雨又挡风，是家又是具（猜一字）', o: ['富', '家', '室', '安'], a: 0, e: '富字拆开：宀(房屋)+一口田' },
      { q: '什么海不产鱼？', o: ['脑海', '大海', '红海', '死海'], a: 0, e: '脑海是比喻思维，不产鱼' },
      { q: '如何让18+18=36变成正确的且只动一笔？', o: ['把等号改成不等号', '无法做到', '把+改成-', '把18改成19'], a: 0, e: '一动等号变成≠，18+18≠36是错误的，但脑筋急转弯中把=改成≠就是正确答案' },
    ],
  };

  const gradeQuestions = allQuestions[grade] || allQuestions[5];
  for (const q of gradeQuestions) {
    questions.push({ question: q.q, options: q.o, answer: q.a, explanation: q.e, grade, subject: 'riddle' as const, difficulty: grade <= 3 ? 1 : grade <= 6 ? 2 : 3 });
  }
  return questions;
}

export function generateAllQuestions(): QuizQuestionInput[] {
  const all: QuizQuestionInput[] = [];

  for (let grade = 1; grade <= 9; grade++) {
    const mathQuestions = generateMathQuestions(grade, grade * 100);
    const chineseQuestions = generateChineseQuestions(grade);
    const scienceQuestions = generateScienceQuestions(grade);
    const funQuestions = generateFunQuestions(grade);
    const riddleQuestions = generateRiddleQuestions(grade);

    all.push(...mathQuestions);
    all.push(...chineseQuestions);
    all.push(...scienceQuestions);
    all.push(...funQuestions);
    all.push(...riddleQuestions);
  }

  // 补齐到999题
  while (all.length < 999) {
    const grade = (all.length % 9) + 1;
    const extra = generateMathQuestions(grade, all.length);
    const needed = Math.min(extra.length, 999 - all.length);
    all.push(...extra.slice(0, needed));
  }

  return all.slice(0, 999);
}
