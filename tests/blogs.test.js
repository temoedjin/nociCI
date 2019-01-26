const Page = require('./helpers/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
    const url = await page.url();
  });

  describe('and using valid input', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const header = await page.getContentsOf('form h5');
      expect(header).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('My Title');
      expect(content).toEqual('My Content');
    });
  });

  describe('and using INvalid input', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const error1 = await page.getContentsOf('.title .red-text');
      expect(error1).toEqual('You must provide a value');
      const error2 = await page.getContentsOf('.content .red-text');
      expect(error2).toEqual('You must provide a value');
    });
  });
});

describe('When NOT logged in', async () => {
  const requests = [
    { method: 'post', path: '/api/blogs', data: { title: 'T', content: 'C' } },
    { method: 'get', path: '/api/blogs' }
  ];

  test('Blog related action that are prohibited', async () => {
    const results = await page.execRequests(requests);

    results.forEach(response => {
      expect(response).toEqual({ error: 'You must log in!' });
    });
  });
  // test('User can not create blog post', async () => {
  //   const response = await page.post('/api/blogs', {
  //     title: 'My Title',
  //     content: 'My Content'
  //   });
  //   expect(response).toEqual({ error: 'You must log in!' });
  // });

  // test('User can not see blogs', async () => {
  //   const response = await page.get('/api/blogs');
  //   expect(response).toEqual({ error: 'You must log in!' });
  // });
});
