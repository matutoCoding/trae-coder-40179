import type {
  CallRecord,
  Utterance,
  DailyMetric,
  WordCloudItem,
  WeeklyInsight,
  HeatmapCell,
  AlertItem,
  CombinationCell,
  TimeRange,
  AnomalyType,
  ReportData,
} from './types';

export const AGENT_GROUPS = ['一组-高端业务', '二组-标准业务', '三组-售后支持', '四组-技术咨询', '五组-VIP专线'];
export const BUSINESS_TYPES = ['信用卡', '个人贷款', '理财服务', '借记卡', '网银支付', '投诉建议'];
export const CALL_REASONS = [
  '账户查询', '交易咨询', '费用疑问', '额度申请',
  '密码问题', '挂失补办', '投诉建议', '营销咨询', '技术支持',
];

const baseDate = new Date('2026-06-22');

function daysAgo(n: number): Date {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - n);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(5, 10);
}

function formatDateTime(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

const agentPool = [
  { id: 'A001', name: '张婉清', group: '一组-高端业务' },
  { id: 'A002', name: '杨志强', group: '一组-高端业务' },
  { id: 'A011', name: '赵子涵', group: '一组-高端业务' },
  { id: 'A015', name: '王思琪', group: '二组-标准业务' },
  { id: 'A028', name: '周文博', group: '二组-标准业务' },
  { id: 'A036', name: '林立峰', group: '二组-标准业务' },
  { id: 'A007', name: '李明远', group: '三组-售后支持' },
  { id: 'A035', name: '吴晓敏', group: '三组-售后支持' },
  { id: 'A031', name: '何雨萱', group: '三组-售后支持' },
  { id: 'A003', name: '刘雅婷', group: '四组-技术咨询' },
  { id: 'A019', name: '郑晓东', group: '四组-技术咨询' },
  { id: 'A024', name: '黄雨桐', group: '四组-技术咨询' },
  { id: 'A022', name: '陈浩然', group: '五组-VIP专线' },
  { id: 'A042', name: '孙美玲', group: '五组-VIP专线' },
  { id: 'A048', name: '徐文博', group: '五组-VIP专线' },
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateCallsForRange(range: TimeRange): CallRecord[] {
  const dayCounts = { today: 12, week: 48, '30d': 180 };
  const total = dayCounts[range];
  const calls: CallRecord[] = [];

  for (let i = 0; i < total; i++) {
    const agent = agentPool[i % agentPool.length];
    const businessIdx = Math.floor(seededRandom(i * 7) * BUSINESS_TYPES.length);
    const business = BUSINESS_TYPES[businessIdx];
    const reasonIdx = Math.floor(seededRandom(i * 13) * CALL_REASONS.length);
    const reason = CALL_REASONS[reasonIdx];

    const dayOffset = range === 'today' ? 0 : Math.floor(seededRandom(i * 3) * (range === 'week' ? 7 : 30));
    const callDate = daysAgo(dayOffset);
    const hour = 9 + Math.floor(seededRandom(i * 5) * 9);
    callDate.setHours(hour, Math.floor(seededRandom(i * 11) * 60), Math.floor(seededRandom(i * 17) * 60));

    const isHighQuality = seededRandom(i * 19) > 0.7;
    const isLowQuality = seededRandom(i * 23) < 0.25;

    const score = isHighQuality
      ? 4.3 + seededRandom(i * 29) * 0.7
      : isLowQuality
      ? 1.0 + seededRandom(i * 31) * 2.0
      : 3.0 + seededRandom(i * 37) * 1.5;

    const duration = Math.floor(120 + seededRandom(i * 41) * 480);
    const interruptions = isLowQuality ? Math.floor(3 + seededRandom(i * 43) * 7) : Math.floor(seededRandom(i * 47) * 3);
    const silenceMs = isLowQuality ? Math.floor(5000 + seededRandom(i * 53) * 18000) : Math.floor(seededRandom(i * 59) * 3000);

    const anomalyTags: string[] = [];
    if (interruptions >= 4) anomalyTags.push('interruption');
    if (silenceMs > 8000) anomalyTags.push('long_silence');
    if (score < 2.5) anomalyTags.push('negative_sentiment');
    if (score < 2 && business === '投诉建议') anomalyTags.push('complaint_word');
    if (score < 2 && seededRandom(i * 61) < 0.3) anomalyTags.push('rude_language');
    if (score < 2.5 && seededRandom(i * 67) < 0.4) anomalyTags.push('escalation');

    const escalated = anomalyTags.includes('escalation');
    const escalationReasons = [
      '坐席无法解决客户问题',
      '客户对答复不满意',
      '客户要求主管处理',
      '涉及复杂业务需上级审批',
      '客户情绪激动要求升级',
    ];

    const summaries = [
      '客户咨询账户余额及近期交易明细，坐席查询并解答。',
      '客户反映利息计算与预期不符，情绪较为激动。',
      '客户申请提升信用卡额度，坐席指导线上操作。',
      '客户投诉扣款异常，坐席协助查询交易记录。',
      '客户反馈网银转账失败，坐席排查风控原因。',
      '客户咨询理财产品收益情况，坐席介绍产品特点。',
      '客户卡片丢失需紧急挂失，坐席快速处理并安抚。',
      '客户反馈客服态度问题，要求投诉坐席。',
      '客户咨询贷款申请进度，坐席查询并告知预计时间。',
      '客户咨询积分兑换规则，坐席详细说明操作步骤。',
    ];

    calls.push({
      callId: `CALL-${formatDate(callDate).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      agentId: agent.id,
      agentName: agent.name,
      agentGroup: agent.group,
      businessType: business,
      callReason: reason,
      startTime: formatDateTime(callDate),
      durationSec: duration,
      customerScore: Math.round(score * 10) / 10,
      anomalyTags,
      interruptionCount: interruptions,
      silenceDurationMs: silenceMs,
      escalated,
      escalationReason: escalated ? escalationReasons[i % escalationReasons.length] : undefined,
      sentiment: score >= 4 ? 'positive' : score >= 2.5 ? 'neutral' : 'negative',
      summary: summaries[i % summaries.length],
      highLightPhrases: [
        '利息太高',
        '我要投诉',
        '扣款异常',
        '为什么',
        '不合理',
      ].slice(0, anomalyTags.length + 1),
    });
  }

  return calls.sort((a, b) => b.startTime.localeCompare(a.startTime));
}

const callsByRange: Record<TimeRange, CallRecord[]> = {
  today: generateCallsForRange('today'),
  week: generateCallsForRange('week'),
  '30d': generateCallsForRange('30d'),
};

export function getCallsByTimeRange(range: TimeRange): CallRecord[] {
  return callsByRange[range];
}

export function getCallById(callId: string): CallRecord | undefined {
  return (
    callsByRange.today.find((c) => c.callId === callId) ||
    callsByRange.week.find((c) => c.callId === callId) ||
    callsByRange['30d'].find((c) => c.callId === callId)
  );
}

export function getCallsByCombination(
  range: TimeRange,
  businessType: string,
  agentGroup: string,
  callReason: string
): CallRecord[] {
  const calls = getCallsByTimeRange(range);
  return calls.filter((c) => {
    if (businessType !== 'all' && c.businessType !== businessType) return false;
    if (agentGroup !== 'all' && c.agentGroup !== agentGroup) return false;
    if (callReason !== 'all' && c.callReason !== callReason) return false;
    return true;
  });
}

export function getMostRepresentativeCall(
  range: TimeRange,
  anomalyType: AnomalyType | 'all'
): CallRecord | null {
  const calls = getCallsByTimeRange(range);
  if (anomalyType === 'all') {
    return calls.find((c) => c.anomalyTags.length > 0) || null;
  }
  if (anomalyType === 'escalation') {
    return calls.find((c) => c.escalated) || null;
  }
  return calls.find((c) => c.anomalyTags.includes(anomalyType)) || null;
}

export function getUtterancesByCallId(callId: string): Utterance[] {
  const call = getCallById(callId);
  if (!call) return [];

  const hasLongSilence = call.anomalyTags.includes('long_silence');
  const hasComplaint = call.anomalyTags.includes('complaint_word');
  const hasRude = call.anomalyTags.includes('rude_language');
  const hasEscalation = call.anomalyTags.includes('escalation');

  const utterances: Utterance[] = [
    {
      utteranceId: `${callId}-U1`,
      callId,
      speaker: 'customer',
      text: '您好，我想咨询一下关于我这笔账单的问题。',
      startTimeMs: 0,
      endTimeMs: 5500,
      emotionScore: 0.6,
    },
    {
      utteranceId: `${callId}-U2`,
      callId,
      speaker: 'agent',
      text: `您好，${call.agentName}为您服务。请问您的账号或卡号方便提供一下吗？`,
      startTimeMs: 6000,
      endTimeMs: 13000,
    },
  ];

  let currentTime = 14000;

  if (hasComplaint) {
    utterances.push({
      utteranceId: `${callId}-U3`,
      callId,
      speaker: 'customer',
      text: '是这样的，我上个月的账单上有一笔200块钱的消费，我根本没有消费过啊！这到底怎么回事？',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 9000,
      anomalyType: 'complaint_word',
      emotionScore: 0.2,
    });
    currentTime += 10000;
  } else {
    utterances.push({
      utteranceId: `${callId}-U3`,
      callId,
      speaker: 'customer',
      text: '好的，卡号是6222****8891，我想查一下最近的交易明细。',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 7000,
      emotionScore: 0.5,
    });
    currentTime += 8000;
  }

  if (hasLongSilence) {
    utterances.push({
      utteranceId: `${callId}-U4`,
      callId,
      speaker: 'agent',
      text: '好的，我帮您查一下，请稍等...',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 4000,
    });
    currentTime += 5000;

    utterances.push({
      utteranceId: `${callId}-U5`,
      callId,
      speaker: 'agent',
      text: '...',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 18000,
      anomalyType: 'long_silence',
    });
    currentTime += 19000;

    utterances.push({
      utteranceId: `${callId}-U6`,
      callId,
      speaker: 'customer',
      text: '喂？还在吗？怎么这么久啊？查个账需要这么长时间吗？',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 6000,
      emotionScore: 0.25,
    });
    currentTime += 7000;
  } else {
    utterances.push({
      utteranceId: `${callId}-U4`,
      callId,
      speaker: 'agent',
      text: '好的，我这边帮您查询一下，请稍等片刻。',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 4500,
    });
    currentTime += 5500;
  }

  if (hasRude) {
    utterances.push({
      utteranceId: `${callId}-U7`,
      callId,
      speaker: 'agent',
      text: '这个嘛，合同里都写了的，你自己没看清楚吧？我们费用都是明码标价的。',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 9000,
      anomalyType: 'rude_language',
    });
    currentTime += 10000;

    utterances.push({
      utteranceId: `${callId}-U8`,
      callId,
      speaker: 'customer',
      text: '你这什么态度？合同字那么小谁看得清！你们这是欺骗消费者！',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 8000,
      emotionScore: 0.1,
    });
    currentTime += 9000;

    utterances.push({
      utteranceId: `${callId}-U9`,
      callId,
      speaker: 'agent',
      text: '你吼什么吼啊，签合同的时候是你自己签的吧？现在来问我有什么用？',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 8500,
      anomalyType: 'rude_language',
    });
    currentTime += 9500;
  } else {
    utterances.push({
      utteranceId: `${callId}-U7`,
      callId,
      speaker: 'agent',
      text: '查到了，您最近有三笔消费，分别是...',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 7000,
    });
    currentTime += 8000;
  }

  if (hasEscalation) {
    utterances.push({
      utteranceId: `${callId}-U10`,
      callId,
      speaker: 'customer',
      text: '我不跟你说了，把你们主管叫来！你解决不了问题，我要投诉你！',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 7000,
      anomalyType: 'escalation',
      emotionScore: 0.05,
    });
    currentTime += 8000;

    utterances.push({
      utteranceId: `${callId}-U11`,
      callId,
      speaker: 'agent',
      text: '好的好的，您别激动，我马上帮您转接。',
      startTimeMs: currentTime,
      endTimeMs: currentTime + 4000,
    });
  }

  return utterances;
}

function generateDailyMetrics(range: TimeRange): DailyMetric[] {
  const days = range === 'today' ? 1 : range === 'week' ? 7 : 30;
  const metrics: DailyMetric[] = [];

  const baseTotal = range === 'today' ? 2500 : range === 'week' ? 4200 : 4500;
  const baseComplaint = range === 'today' ? 5.2 : range === 'week' ? 3.8 : 3.5;
  const baseInterrupt = range === 'today' ? 2.9 : range === 'week' ? 2.2 : 2.0;
  const baseSilence = range === 'today' ? 5.8 : range === 'week' ? 4.2 : 3.8;
  const baseEscalation = range === 'today' ? 2.8 : range === 'week' ? 1.9 : 1.7;
  const baseScore = range === 'today' ? 3.5 : range === 'week' ? 3.9 : 4.0;

  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const variation = Math.sin(i * 0.8) * 0.3 + 1;
    metrics.push({
      date: formatDate(d),
      totalCalls: Math.floor(baseTotal * variation * (0.9 + seededRandom(i) * 0.2)),
      complaintRate: Math.round(baseComplaint * variation * 10) / 10,
      avgInterruptions: Math.round(baseInterrupt * variation * 10) / 10,
      silenceAnomalyRate: Math.round(baseSilence * variation * 10) / 10,
      escalationRate: Math.round(baseEscalation * variation * 10) / 10,
      avgScore: Math.round((baseScore + (1 - variation) * 0.5) * 10) / 10,
    });
  }

  return metrics;
}

const metricsByRange: Record<TimeRange, DailyMetric[]> = {
  today: generateDailyMetrics('today'),
  week: generateDailyMetrics('week'),
  '30d': generateDailyMetrics('30d'),
};

export function getDailyMetrics(range: TimeRange): DailyMetric[] {
  return metricsByRange[range];
}

const baseWordCloud: WordCloudItem[] = [
  { text: '利息太高', value: 187, category: 'complaint' },
  { text: '扣款异常', value: 156, category: 'complaint' },
  { text: '额度不够', value: 142, category: 'complaint' },
  { text: '手续费', value: 128, category: 'complaint' },
  { text: '审批太慢', value: 115, category: 'complaint' },
  { text: '客服态度', value: 98, category: 'complaint' },
  { text: '退款问题', value: 87, category: 'complaint' },
  { text: '转账失败', value: 76, category: 'complaint' },
  { text: '系统故障', value: 68, category: 'complaint' },
  { text: '短信通知', value: 54, category: 'complaint' },
  { text: '霸王条款', value: 45, category: 'complaint' },
  { text: '隐瞒费用', value: 38, category: 'complaint' },
  { text: '非常满意', value: 234, category: 'praise' },
  { text: '服务专业', value: 189, category: 'praise' },
  { text: '耐心解答', value: 167, category: 'praise' },
  { text: '效率高', value: 143, category: 'praise' },
  { text: '解决问题', value: 121, category: 'praise' },
  { text: '态度好', value: 98, category: 'praise' },
  { text: '主动回电', value: 76, category: 'praise' },
  { text: '还款方式', value: 89, category: 'neutral' },
  { text: '账单查询', value: 76, category: 'neutral' },
  { text: '积分兑换', value: 65, category: 'neutral' },
  { text: '激活卡片', value: 54, category: 'neutral' },
  { text: '修改密码', value: 43, category: 'neutral' },
  { text: '开户行', value: 32, category: 'neutral' },
];

export function getWordCloudData(range: TimeRange): WordCloudItem[] {
  const multiplier = range === 'today' ? 0.15 : range === 'week' ? 1 : 3.5;
  return baseWordCloud.map((w) => ({
    ...w,
    value: Math.floor(w.value * multiplier),
  }));
}

export function getHeatmapData(range: TimeRange): HeatmapCell[] {
  const data: HeatmapCell[] = [];
  const multiplier = range === 'today' ? 0.2 : range === 'week' ? 1 : 3.5;

  BUSINESS_TYPES.forEach((b, bi) => {
    AGENT_GROUPS.forEach((g, gi) => {
      const baseValue = 10 + bi * 8 + gi * 5 + ((bi + gi) % 3) * 15;
      const boost = b === '投诉建议' ? 25 : g === '三组-售后支持' ? 15 : 0;
      data.push({
        businessType: b,
        agentGroup: g,
        value: Math.floor((baseValue + boost) * multiplier),
      });
    });
  });
  return data;
}

export function getAlerts(range: TimeRange): AlertItem[] {
  const calls = getCallsByTimeRange(range);
  const anomalyCalls = calls.filter((c) => c.anomalyTags.length > 0).slice(0, 8);

  return anomalyCalls.map((c, idx) => {
    const primaryAnomaly = c.anomalyTags[0] as 'complaint' | 'interruption' | 'silence' | 'escalation';
    const typeMap: Record<string, 'complaint' | 'interruption' | 'silence' | 'escalation'> = {
      complaint_word: 'complaint',
      rude_language: 'complaint',
      interruption: 'interruption',
      long_silence: 'silence',
      escalation: 'escalation',
      negative_sentiment: 'complaint',
      script_deviation: 'interruption',
    };
    const type = typeMap[primaryAnomaly] || 'complaint';

    const msgMap = {
      complaint: '检测到投诉类关键词',
      interruption: `打断客户${c.interruptionCount}次`,
      silence: `沉默时长${Math.round(c.silenceDurationMs / 1000)}秒`,
      escalation: '客户要求升级处理',
    };

    const severity = c.customerScore < 2 ? 'high' : c.customerScore < 3 ? 'medium' : 'low';

    return {
      id: `ALT-${String(idx + 1).padStart(3, '0')}`,
      callId: c.callId,
      agentName: c.agentName,
      type,
      severity,
      message: msgMap[type],
      timestamp: c.startTime.slice(11, 16),
    };
  });
}

export const WEEKLY_INSIGHTS: WeeklyInsight[] = [
  {
    id: 'WI-001',
    category: 'problem',
    title: '贷款利率不透明引发投诉激增',
    content: '本周共收到87起关于贷款实际利率与宣传不符的投诉，主要集中在"服务费"、"担保费"等隐藏费用未充分告知。客户普遍反映合同文字过小，签约时未注意附加条款。三组-售后支持处理此类投诉占比最高，达35%。',
    frequency: 87,
    relatedCalls: ['CALL-0622-028', 'CALL-0620-015'],
    selected: true,
  },
  {
    id: 'WI-002',
    category: 'problem',
    title: '网银风控拦截误判率偏高',
    content: '客户反馈正常转账被系统误拦截，需二次致电解除，本周累计42起。部分老年客户因操作复杂产生强烈不满。建议优化风控模型并增加人工复核通道。',
    frequency: 42,
    relatedCalls: ['CALL-0621-003', 'CALL-0619-024'],
    selected: true,
  },
  {
    id: 'WI-003',
    category: 'problem',
    title: '银行卡盗刷争议处理流程繁琐',
    content: '35起盗刷投诉中，有22起客户反映需要提供过多证明材料且处理周期超过7个工作日。客户体验极差，容易引发监管投诉。',
    frequency: 35,
    relatedCalls: ['CALL-0622-007', 'CALL-0618-011'],
    selected: false,
  },
  {
    id: 'WI-004',
    category: 'problem',
    title: '信用卡额度调整审核周期过长',
    content: '用户申请临时额度调整平均等待时间超过48小时，28位客户因等待期间无法使用而产生投诉。建议引入自动化审批规则。',
    frequency: 28,
    relatedCalls: [],
    selected: false,
  },
  {
    id: 'WI-005',
    category: 'problem',
    title: '积分兑换系统故障频发',
    content: '本周系统维护期间，19位客户反映积分兑换失败或积分扣除但商品未发货。技术部门已定位为缓存服务异常。',
    frequency: 19,
    relatedCalls: [],
    selected: false,
  },
  {
    id: 'WI-006',
    category: 'violation',
    title: '"你自己没看清楚吧"——推卸责任类表达',
    content: '本周检测到坐席使用推卸责任类句式共63次，其中三组-售后支持出现频率最高（21次）。这类表达极易激发客户对立情绪，是升级投诉的主要诱因之一。',
    frequency: 63,
    relatedCalls: ['CALL-0622-028'],
    agentName: '周文博',
    selected: true,
  },
  {
    id: 'WI-007',
    category: 'violation',
    title: '"你吼什么吼啊"——与客户争执类表达',
    content: '检测到4起坐席与客户发生言语冲突，均发生在客户情绪激动后坐席未能保持冷静。涉事坐席集中在入职3个月以内的新人，建议增加情绪管理专项培训。',
    frequency: 4,
    relatedCalls: ['CALL-0622-028', 'CALL-0620-035'],
    agentName: '周文博',
    selected: true,
  },
  {
    id: 'WI-008',
    category: 'violation',
    title: '未按规范开头语问候',
    content: '抽查发现18%的通话未使用标准问候语"您好，请问有什么可以帮您"，部分坐席直接开口"说"或"什么事"。新员工组问题尤为突出。',
    frequency: 156,
    relatedCalls: [],
    selected: false,
  },
  {
    id: 'WI-009',
    category: 'violation',
    title: '通话过程中长时间沉默未致歉',
    content: '检测到沉默超过5秒的通话中有45%坐席未向客户说明等待原因，容易引发客户疑虑和不满。四组-技术咨询因业务查询需要时间，此问题相对突出。',
    frequency: 89,
    relatedCalls: ['CALL-0621-003'],
    agentName: '刘雅婷',
    selected: false,
  },
  {
    id: 'WI-010',
    category: 'praise',
    title: '"您放心，我会全程帮您跟进"——承诺式安抚话术',
    content: '坐席赵子涵在处理投诉时使用的安抚话术，配合后续主动回电跟进，本周该坐席客户评分平均达4.9分。建议作为培训案例在全中心推广。',
    frequency: 12,
    relatedCalls: ['CALL-0622-011'],
    agentName: '赵子涵',
    score: 4.9,
    selected: true,
  },
  {
    id: 'WI-011',
    category: 'praise',
    title: '"我理解您现在的心情，换成我也会着急"——共情表达',
    content: '王思琪在处理客户焦虑情绪时使用的共情类表达，有效降低了客户负面情绪强度，后续问题解决率高达95%。该坐席连续三周评分位居前列。',
    frequency: 23,
    relatedCalls: ['CALL-0622-015'],
    agentName: '王思琪',
    score: 4.8,
    selected: true,
  },
  {
    id: 'WI-012',
    category: 'praise',
    title: '"为了节省您的时间，我帮您把相关信息整理一下"——主动服务意识',
    content: '吴晓敏在解答复杂业务时主动为客户整理要点，显著降低了客户的理解难度。客户事后回电表扬该坐席"想得很周到"。',
    frequency: 8,
    relatedCalls: ['CALL-0621-035'],
    agentName: '吴晓敏',
    score: 4.5,
    selected: false,
  },
  {
    id: 'WI-013',
    category: 'praise',
    title: '"稍后我会发一条短信给您，方便您随时查看"——闭环意识',
    content: '孙美玲在通话结束后主动发送总结短信，提升了客户体验和后续自助解决能力。该做法可有效降低重复来电率。',
    frequency: 15,
    relatedCalls: ['CALL-0622-042'],
    agentName: '孙美玲',
    score: 4.7,
    selected: false,
  },
];

export function getWeeklyInsights(range: TimeRange): WeeklyInsight[] {
  if (range === 'today') {
    return WEEKLY_INSIGHTS.slice(0, 6).map((i) => ({
      ...i,
      frequency: Math.floor(i.frequency * 0.15),
    }));
  }
  if (range === '30d') {
    return WEEKLY_INSIGHTS.map((i) => ({
      ...i,
      frequency: Math.floor(i.frequency * 3.8),
    }));
  }
  return WEEKLY_INSIGHTS;
}

export function getCombinationAnalysis(range: TimeRange): CombinationCell[] {
  const cells: CombinationCell[] = [];
  const multiplier = range === 'today' ? 0.2 : range === 'week' ? 1 : 3.8;

  const topIssues = [
    '利息争议', '额度审批', '扣款异常', '系统卡顿', '服务态度',
    '流程繁琐', '信息不全', '操作指导',
  ];

  BUSINESS_TYPES.slice(0, 4).forEach((business, bi) => {
    AGENT_GROUPS.slice(0, 3).forEach((group, gi) => {
      CALL_REASONS.slice(0, 3).forEach((reason, ri) => {
        const baseTotal = 80 + (bi + gi + ri) * 15;
        const anomalyRate = 2 + ((bi * 3 + gi * 5 + ri * 2) % 8);
        const total = Math.floor(baseTotal * multiplier);
        const anomalyCount = Math.floor(total * anomalyRate / 100);

        cells.push({
          businessType: business,
          agentGroup: group,
          callReason: reason,
          totalCalls: total,
          anomalyCount,
          anomalyRate: Math.round(anomalyRate * 10) / 10,
          avgScore: Math.round((4.2 - anomalyRate * 0.25) * 10) / 10,
          topIssue: topIssues[(bi + gi + ri) % topIssues.length],
          sampleCallIds: getCallsByTimeRange(range)
            .filter((c) => c.businessType === business && c.anomalyTags.length > 0)
            .slice(0, 3)
            .map((c) => c.callId),
        });
      });
    });
  });

  return cells.sort((a, b) => b.anomalyRate - a.anomalyRate);
}

export function getReportData(range: TimeRange, selectedIds: Set<string>): ReportData {
  const insights = getWeeklyInsights(range);
  const selected = insights.filter((i) => selectedIds.has(i.id));
  const metrics = getDailyMetrics(range);
  const latest = metrics[metrics.length - 1];
  const calls = getCallsByTimeRange(range);

  const startDate = metrics[0]?.date || '--';
  const endDate = metrics[metrics.length - 1]?.date || '--';
  const totalCalls = metrics.reduce((sum, m) => sum + m.totalCalls, 0);

  const periodLabel = range === 'today' ? '今日' : range === 'week' ? '本周' : '近30天';

  const representativeCalls = calls
    .filter((c) => c.anomalyTags.length >= 2)
    .slice(0, 5);

  return {
    period: periodLabel,
    startDate: `2026-${startDate}`,
    endDate: `2026-${endDate}`,
    totalCalls,
    avgScore: latest?.avgScore || 0,
    complaintRate: latest?.complaintRate || 0,
    problems: selected.filter((i) => i.category === 'problem'),
    violations: selected.filter((i) => i.category === 'violation'),
    praises: selected.filter((i) => i.category === 'praise'),
    representativeCalls,
  };
}

export function generateReportHTML(report: ReportData): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>客服质检报告 - ${report.period}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, "Noto Sans SC", sans-serif;
    background: #0B1D3A;
    color: #E6EBF5;
    padding: 40px;
    line-height: 1.6;
  }
  .container { max-width: 900px; margin: 0 auto; }
  h1 {
    font-size: 28px;
    margin-bottom: 8px;
    background: linear-gradient(90deg, #818CF8, #A78BFA);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle { color: #8DA8D3; margin-bottom: 30px; font-size: 14px; }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 36px;
  }
  .summary-card {
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 12px;
    padding: 20px;
  }
  .summary-card .label { font-size: 12px; color: #8DA8D3; margin-bottom: 6px; }
  .summary-card .value { font-size: 28px; font-weight: 700; color: white; }
  h2 {
    font-size: 18px;
    margin: 32px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(99, 102, 241, 0.2);
    color: white;
  }
  .insight-item {
    background: rgba(11, 29, 58, 0.6);
    border: 1px solid rgba(99, 102, 241, 0.15);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
  }
  .insight-item .title {
    font-size: 15px;
    font-weight: 600;
    color: white;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .insight-item .freq {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(255, 107, 53, 0.15);
    color: #FF8A50;
  }
  .insight-item .content { font-size: 13px; color: #C2CFE8; }
  .problem .freq { background: rgba(255, 107, 53, 0.15); color: #FF8A50; }
  .violation .freq { background: rgba(244, 63, 94, 0.15); color: #FB7185; }
  .praise .freq { background: rgba(16, 185, 129, 0.15); color: #34D399; }
  .call-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .call-table th, .call-table td {
    padding: 10px 12px;
    text-align: left;
    font-size: 12px;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
  }
  .call-table th { color: #8DA8D3; font-weight: 500; }
  .call-table td { color: #C2CFE8; }
  .footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid rgba(99, 102, 241, 0.1);
    text-align: center;
    color: #64748B;
    font-size: 12px;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    margin-right: 4px;
    background: rgba(99, 102, 241, 0.15);
    color: #818CF8;
  }
</style>
</head>
<body>
<div class="container">
  <h1>客服质检周报</h1>
  <p class="subtitle">报告周期：${report.startDate} ~ ${report.endDate} · ${report.period}质检洞察</p>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">总通话量</div>
      <div class="value">${report.totalCalls.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="label">平均评分</div>
      <div class="value">${report.avgScore.toFixed(1)}</div>
    </div>
    <div class="summary-card">
      <div class="label">投诉率</div>
      <div class="value">${report.complaintRate.toFixed(1)}%</div>
    </div>
    <div class="summary-card">
      <div class="label">已选洞察</div>
      <div class="value">${report.problems.length + report.violations.length + report.praises.length}</div>
    </div>
  </div>

  ${report.problems.length > 0 ? `
  <h2>一、常见客户问题</h2>
  ${report.problems.map((p, i) => `
  <div class="insight-item problem">
    <div class="title">
      <span>${i + 1}. ${p.title}</span>
      <span class="freq">${p.frequency} 次</span>
    </div>
    <div class="content">${p.content}</div>
  </div>
  `).join('')}
  ` : ''}

  ${report.violations.length > 0 ? `
  <h2>二、坐席违规句式</h2>
  ${report.violations.map((p, i) => `
  <div class="insight-item violation">
    <div class="title">
      <span>${i + 1}. ${p.title}</span>
      <span class="freq">${p.frequency} 次</span>
    </div>
    <div class="content">${p.content}</div>
    ${p.agentName ? `<div class="content" style="margin-top:6px;color:#8DA8D3;">涉及坐席：${p.agentName}</div>` : ''}
  </div>
  `).join('')}
  ` : ''}

  ${report.praises.length > 0 ? `
  <h2>三、优秀安抚话术</h2>
  ${report.praises.map((p, i) => `
  <div class="insight-item praise">
    <div class="title">
      <span>${i + 1}. ${p.title}</span>
      <span class="freq">${p.agentName || ''} ${p.score ? '★' + p.score : ''}</span>
    </div>
    <div class="content">${p.content}</div>
  </div>
  `).join('')}
  ` : ''}

  ${report.representativeCalls.length > 0 ? `
  <h2>四、代表异常通话清单</h2>
  <table class="call-table">
    <thead>
      <tr>
        <th>通话ID</th>
        <th>坐席</th>
        <th>业务类型</th>
        <th>时长</th>
        <th>评分</th>
        <th>异常标签</th>
      </tr>
    </thead>
    <tbody>
      ${report.representativeCalls.map((c) => `
      <tr>
        <td style="font-family: monospace;">${c.callId.slice(-8)}</td>
        <td>${c.agentName}</td>
        <td>${c.businessType}</td>
        <td>${Math.floor(c.durationSec / 60)}:${String(c.durationSec % 60).padStart(2, '0')}</td>
        <td>${c.customerScore.toFixed(1)}</td>
        <td>${c.anomalyTags.slice(0, 2).map(t => `<span class="badge">${t}</span>`).join('')}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <div class="footer">
    本报告由 QC Insight 智能质检平台自动生成 · ${report.endDate}
  </div>
</div>
</body>
</html>`;
}

export function generateReportText(report: ReportData): string {
  const lines: string[] = [];

  lines.push('╔══════════════════════════════════════════════════════════╗');
  lines.push('║               客 服 质 检 周 报                           ║');
  lines.push('╚══════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`报告周期：${report.startDate} ~ ${report.endDate}`);
  lines.push(`统计维度：${report.period}质检洞察`);
  lines.push('');
  lines.push('━━━━━━━━━━━━ 核心数据概览 ━━━━━━━━━━━━');
  lines.push('');
  lines.push(`  总通话量：   ${report.totalCalls.toLocaleString()} 通`);
  lines.push(`  平均评分：   ${report.avgScore.toFixed(1)} 分`);
  lines.push(`  投诉率：     ${report.complaintRate.toFixed(1)}%`);
  lines.push(`  已选洞察：   ${report.problems.length + report.violations.length + report.praises.length} 条`);
  lines.push('');

  if (report.problems.length > 0) {
    lines.push('━━━━━━━━━━━━ 一、常见客户问题 ━━━━━━━━━━━━');
    lines.push('');
    report.problems.forEach((p, i) => {
      lines.push(`  【问题 ${i + 1}】${p.title}`);
      lines.push(`         频次：${p.frequency} 次`);
      lines.push(`         描述：${p.content}`);
      lines.push('');
    });
  }

  if (report.violations.length > 0) {
    lines.push('━━━━━━━━━━━━ 二、坐席违规句式 ━━━━━━━━━━━━');
    lines.push('');
    report.violations.forEach((p, i) => {
      lines.push(`  【违规 ${i + 1}】${p.title}`);
      lines.push(`         频次：${p.frequency} 次`);
      if (p.agentName) lines.push(`         涉及坐席：${p.agentName}`);
      lines.push(`         描述：${p.content}`);
      lines.push('');
    });
  }

  if (report.praises.length > 0) {
    lines.push('━━━━━━━━━━━━ 三、优秀安抚话术 ━━━━━━━━━━━━');
    lines.push('');
    report.praises.forEach((p, i) => {
      lines.push(`  【优秀 ${i + 1}】${p.title}`);
      lines.push(`         坐席：${p.agentName || '多位坐席'}`);
      if (p.score) lines.push(`         评分：★${p.score}`);
      lines.push(`         描述：${p.content}`);
      lines.push('');
    });
  }

  if (report.representativeCalls.length > 0) {
    lines.push('━━━━━━━━━━━━ 四、代表异常通话 ━━━━━━━━━━━━');
    lines.push('');
    lines.push('  通话ID        坐席    业务       时长  评分');
    lines.push('  ───────────────────────────────────────────');
    report.representativeCalls.forEach((c) => {
      const dur = `${Math.floor(c.durationSec / 60)}:${String(c.durationSec % 60).padStart(2, '0')}`;
      lines.push(`  ${c.callId.slice(-8).padEnd(12)} ${c.agentName.padEnd(6)} ${c.businessType.padEnd(8)} ${dur.padStart(5)}  ${c.customerScore.toFixed(1)}`);
    });
    lines.push('');
  }

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`本报告由 QC Insight 智能质检平台自动生成`);
  lines.push(`生成时间：${report.endDate}`);

  return lines.join('\n');
}

export const CALL_RECORDS = getCallsByTimeRange('week');
export const DAILY_METRICS = getDailyMetrics('week');
export const WORD_CLOUD_DATA = getWordCloudData('week');
export const HEATMAP_DATA = getHeatmapData('week');
export const ALERTS = getAlerts('week');
