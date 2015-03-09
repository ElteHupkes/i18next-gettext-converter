module.exports = {

    flatten: function(input, options) {
        var flat = {}
          , separator = options.keyseparator || '##';

        function recurse(appendTo, obj, parentKey) {

            for (var m in obj) {
                var kv
                  , value = obj[m]
                  , key = parentKey
                  , context = '';

                if (key.length > 0) {
                    key = key + separator + m;
                } else {
                    key = m;
                }

                // get context if used
                // restoring this to the 0.1.2 state, since otherwise we have
                // to update all our language files manually. Also, frankly,
                // splitting context on an underscore is rather retarded; since
                // underscores are frequently used to, I don't know, split WORDS??
                // Especially retarded if this is done on a sub-path since the information
                // in that case is just lost completely.
                var ctxKey = key;
                if (key.indexOf('_plural') > -1) {
                    ctxKey = ctxKey.replace(new RegExp('_plural_*', 'g'), '');
                    ctxKey = ctxKey.replace(new RegExp('_plural', 'g'), '');
                }
                if (ctxKey.indexOf('context_') > -1) {
                    context = 'context' + ctxKey.substring(ctxKey.lastIndexOf('_'), ctxKey.length);
                } else {
                    context = ctxKey.substring(ctxKey.lastIndexOf('_'), ctxKey.length);
                }
                if (context === key) context = '';

                // append or recurse
                if (typeof value === 'string') {
                    kv = {
                        //id: key.replace(new RegExp(' ', 'g'), ''),
                        key: key,
                        value: value,
                        isPlural: key.indexOf('_plural') > -1,
                        context: context
                    };
                    appendTo[kv.key + kv.context] = kv;
                } else if (Object.prototype.toString.apply(value) === '[object Array]') {
                    kv = {
                        //id: key.replace(new RegExp(' ', 'g'), ''),
                        key: key,
                        value: value.join('\n'),
                        isArray: true,
                        isPlural: key.indexOf('_plural') > -1,
                        context: context
                    };
                    appendTo[kv.key + kv.context] = kv;
                } else {
                    recurse(appendTo, value, key);
                }
            }

        }

        recurse(flat, input, '');

        // append plurals
        for (var m in flat) {
            var kv = flat[m];

            if (kv.isPlural) {
                var parts = kv.key.split('_plural');

                var single = flat[parts[0] + kv.context];
                kv.pluralNumber = parts[1].replace('_', '');
                if (kv.pluralNumber === '') kv.pluralNumber = '1';

                if (single) {
                    single.plurals = single.plurals || [];
                    single.plurals.push(kv);

                    delete flat[m];
                }
            }
        }

        return flat;
    }
};
