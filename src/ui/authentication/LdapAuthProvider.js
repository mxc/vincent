/**
 * Created by mark on 2016/04/27.
 */
import AuthenticationProvider from './AuthenticationProvider';
import LdapAuth  from 'ldapauth-fork';

class LdapAuthProvider extends AuthenticationProvider {

    constructor(provider) {
        super();
        this.provider = provider;
        this.user={};
    }

    authenticate(username, password) {
        var ldap = new LdapAuth({
            url: this.provider.config.get("ldap.url"),
            cache: true
        });

        if (this.provider.config.get('ldapbinddn')) ldap.bindDn= this.provider.config.get("ldapbinddn");
        if (this.provider.config.get('ldapbindcredentials')) bindCredentials = this.provider.config.get("ldapbindcredentials");
        if (this.provider.config.get('ldapsearchbase')) searchBase = this.provider.config.get("ldapsearchbase");
        if (this.provider.config.get('ldapsearchfilter')) searchFilter = this.provider.config.get("ldapsearchfilter");
        if (this.provider.config.get('ldapgroupsearchbase')) groupSearchBase = this.provider.config.get('ldapgroupsearchbase');
        if (this.provider.config.get('ldapgroupsearchfilter')) groupSearchBase = this.provider.config.get('ldapgroupsearchfilter');
        if (this.provider.config.get('ldapgroupdnproperty')) groupDnProperty = this.provider.config.get('ldapgroupdnproperty');

        
        return new Promise(resolve=> {
            ldap.authenticate(username, password, (err, user)=> {
                if (err) {
                    resolve(false);
                } else {
                    this.user = user;
                    resolve(true);
                }
            });
        });

    }

    getGroups(){
        if (this.user._groups){
            //to do determine type of groups returned
            return this.user._groups;
        }
    }

}

export default LdapAuthProvider;
