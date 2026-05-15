import { useState } from 'react';

export function ContactFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center text-2xl"
        title="联系客服"
      >
        💬
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">联系客服</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-3xl mb-2">📱</p>
                <p className="text-sm font-medium text-indigo-700 mb-1">微信客服</p>
                <p className="text-xs text-indigo-500">添加微信号：TeacherPet2024</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-3xl mb-2">📧</p>
                <p className="text-sm font-medium text-amber-700 mb-1">邮箱联系</p>
                <p className="text-xs text-amber-500">505694933@qq.com</p>
              </div>

              <div className="text-center text-xs text-gray-400">
                工作日 9:00-18:00，我们会尽快回复您
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </>
  );
}
