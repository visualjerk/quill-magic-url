var quill = new Quill('#editor', {
	theme: 'snow',
	modules: {
		magicUrl: {
      globalRegularExpression: /(https?:\/\/|www\.|mailto:|tel:)[\S]+/g,
      urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/
    }
	},
	placeholder: 'Paste or type a url ...'
});