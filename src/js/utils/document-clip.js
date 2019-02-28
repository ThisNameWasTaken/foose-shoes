document.clip = function() {
  document.body.classList.add('clipped');
  document.documentElement.classList.add('clipped');
};

document.unclip = function() {
  document.body.classList.remove('clipped');
  document.documentElement.classList.remove('clipped');
};
