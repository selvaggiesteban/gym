import React from 'react';

export function Helmet({ title, description, children }) {
  React.useEffect(() => {
    let t = title;
    let d = description;

    if (children) {
      const childArray = React.Children.toArray(children);
      for (const child of childArray) {
        if (child.type === 'title') t = t || child.props.children;
        if (child.type === 'meta' && child.props.name === 'description') d = d || child.props.content;
      }
    }

    if (t) document.title = t;
    if (d) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', d);
    }
  }, [title, description, children]);
  return null;
}
