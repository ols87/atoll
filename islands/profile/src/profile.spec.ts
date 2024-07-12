// eslint-disable-next-line @nx/enforce-module-boundaries
import '../../../ui/islands/profile/profile.umd';

describe('profile', () => {
  it('work', async () => {
    document.body.innerHTML = '<atoll-profile prop="profile"></atoll-profile>';
    expect(document.body.innerHTML).toContain('profile works');
  });
});
