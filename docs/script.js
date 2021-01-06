var quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    magicUrl: {
      globalRegularExpression: /(https?:\/\/|www\.|mailto:|tel:)[\S]+/gi,
      urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/i
    }
  },
  placeholder: 'Paste or type a url ...'
});
