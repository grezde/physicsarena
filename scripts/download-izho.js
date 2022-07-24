// WEBSITE: https://izho.kz/contest/problems/

a = [...document.getElementsByTagName('tbody')]
  .map(t => [t.querySelector('tr:nth-of-type(5)'), t.querySelector('tr:nth-of-type(6)')]
	.map(tr => tr.querySelector('td:nth-of-type(2)')))
	.map(([a, b]) => [a.querySelectorAll('a')[0], a.querySelectorAll('a')[1], b.querySelectorAll('a')[0], b.querySelectorAll('a')[1]])
	.map(as => as.map(a => a.href))

str = '';
for(let i=0; i<13; i++) {
  str += `curl "${a[i][0]}" > th/${2022-i}-p.pdf\n`;
  str += `curl "${a[i][1]}" > th/${2022-i}-s.pdf\n`;
  str += `curl "${a[i][2]}" > ex/${2022-i}-p.pdf\n`;
  str += `curl "${a[i][3]}" > ex/${2022-i}-s.pdf\n`;
}
console.log(str);
str.includes('rus')