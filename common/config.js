//send mail
exports.contentEmail = (random)=>`Chào mừng bạn đến với Boarding Group,\nĐây là mật khẩu do chúng tôi cung cấp để truy cập vào ứng dụng: ${random}.\nLưu ý: sau khi truy cập, bạn nên đổi mật khẩu ở phần cài đặt.`;
exports.mailSendCode = (random) => `Vui lòng không cung cấp mã xác minh này cho người khác: ${random}.`

//email
exports.email = 'chinhtao1908@gmail.com';
exports.password = 'jcligjtgcjxfeqay';
exports.subject = 'Mật khẩu đăng nhập';
exports.subject_code = 'Mã xác nhận';

//message error
exports.MSG_TIME_CLIENT = 'Yêu cầu của client đã được chấp thuận và đang trong thời gian xử lý.';

//firebase
exports.keyFilename = 'boarding-group-firebase-adminsdk-j57nt-8c9ffe1e4a.json';
exports.storageBucket = 'boarding-group.appspot.com';