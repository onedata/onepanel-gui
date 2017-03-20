import ContentInfo from 'onepanel-gui/components/content-info';
import layout from 'onepanel-gui/templates/components/content-info';


// TODO: i18n
export default ContentInfo.extend({
  layout,

  header: 'No groups',
  subheader: 'but you can join or create one',
  text: 'If other user create a group, lorem ipsum, sit dolor amet. The lorem ipsum.',
  buttonLabel: 'Create new group',

  buttonAction() {
    this.sendAction('transitionTo', 'onedata.sidebar.content', 'groups', 'new');
  }
});
