package de.eddyson.tapestry.dom.vanilla.modules;

import org.apache.tapestry5.SymbolConstants;
import org.apache.tapestry5.annotations.Path;
import org.apache.tapestry5.ioc.MappedConfiguration;
import org.apache.tapestry5.ioc.Resource;
import org.apache.tapestry5.ioc.annotations.Contribute;
import org.apache.tapestry5.ioc.annotations.Symbol;
import org.apache.tapestry5.ioc.services.FactoryDefaults;
import org.apache.tapestry5.ioc.services.SymbolProvider;
import org.apache.tapestry5.services.javascript.JavaScriptModuleConfiguration;
import org.apache.tapestry5.services.javascript.ModuleManager;

public final class TapestryDomVanillaModule {

  @Contribute(SymbolProvider.class)
  @FactoryDefaults
  public static void setupFactoryDefaults(final MappedConfiguration<String, Object> configuration) {
    configuration.override(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER, "vanilla");
  }

  @Contribute(ModuleManager.class)
  public static void setupFoundationFramework(final MappedConfiguration<String, Object> configuration,
      @Symbol(SymbolConstants.JAVASCRIPT_INFRASTRUCTURE_PROVIDER) final String provider,
      @Path("classpath:META-INF/assets/tapestry-dom-vanilla/t5-core-dom-vanilla.js") final Resource domVanilla) {
    if (provider.equals("vanilla")) {
      configuration.add("t5/core/dom", new JavaScriptModuleConfiguration(domVanilla));
    }
  }

  private TapestryDomVanillaModule() {

  }
}