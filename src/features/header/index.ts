import { Header } from './Header';

/**
 * This feature contains the entire behaviour of the Header as a component.
 *
 * Splitting code up into features like this is a little premature because this
 * is a small project but we're just doing it for practice here.
 *
 * Important things: We're not using a state store library like redux or react context.
 * This is to enforce good data ownership.  Yes you'll have to prop drill all your state
 * down a lot of components but it's very good practice for building an understanding of
 * who owns a piece of state.
 */

export { type HeaderProps } from './Header';
export default Header;
